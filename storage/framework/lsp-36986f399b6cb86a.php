<?php
error_reporting(error_reporting() & ~(E_WARNING | E_CORE_WARNING | E_COMPILE_WARNING | E_USER_WARNING | E_DEPRECATED | E_USER_DEPRECATED));
class LspHelper
{
public static function relativePath($path)
{
if (!str_contains($path, base_path())) {
return (string) $path;
}

return ltrim(str_replace(base_path(), '', realpath($path) ?: $path), DIRECTORY_SEPARATOR);
}

public static function isVendor($path)
{
return str_contains($path, base_path('vendor'));
}

public static function propertyDefault(ReflectionProperty $property, ?ReflectionParameter $parameter = null): array
{
if ($property->hasDefaultValue()) {
return ['default' => $property->getDefaultValue()];
}

if ($parameter?->isDefaultValueAvailable()) {
return ['default' => $parameter->getDefaultValue()];
}

return [];
}

public static function formatDefaultValue(mixed $value): mixed
{
return match (true) {
is_array($value) => 'array(...)',
$value instanceof UnitEnum => get_class($value) . '::' . $value->name,
$value instanceof Closure => 'Closure',
is_object($value) => get_class($value),
is_string($value) => var_export($value, true),
is_null($value) => 'null',
is_bool($value) => $value ? 'true' : 'false',
default => $value,
};
}
}

use Illuminate\Auth\DatabaseUserProvider;
use Illuminate\Auth\EloquentUserProvider;
use Illuminate\Auth\GenericUser;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Foundation\Auth\User;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Gate;
use Symfony\Component\Finder\SplFileInfo;

if (!App::bound('auth')) {
echo json_encode([
'authenticatable' => null,
'policies' => (object) [],
]);
} else {
if (File::isDirectory(base_path('app/Models'))) {
collect(File::allFiles(base_path('app/Models')))
->filter(fn (SplFileInfo $file) => $file->getExtension() === 'php')
->each(fn ($file) => include_once ($file));
}

$modelPolicies = collect(get_declared_classes())
->filter(fn ($class) => is_subclass_of($class, Model::class))
->filter(fn ($class) => !in_array($class, [
Pivot::class,
User::class,
]))
->filter(fn ($class) => (new ReflectionClass($class))->isInstantiable())
->flatMap(fn ($class) => [
$class => Gate::getPolicyFor($class),
])
->filter(fn ($policy) => $policy !== null);

function vsCodeGetAuthenticatable()
{
try {
$guard = auth()->guard();

$reflection = new ReflectionClass($guard);

if (!$reflection->hasProperty('provider')) {
return null;
}

$property = $reflection->getProperty('provider');
$provider = $property->getValue($guard);

if ($provider instanceof EloquentUserProvider) {
$providerReflection = new ReflectionClass($provider);
$modelProperty = $providerReflection->getProperty('model');

return str($modelProperty->getValue($provider))->prepend('\\')->toString();
}

if ($provider instanceof DatabaseUserProvider) {
return str(GenericUser::class)->prepend('\\')->toString();
}
} catch (Exception|Throwable $e) {
return null;
}

return null;
}

function vsCodeGetPolicyInfo($policy, $model)
{
$methods = (new ReflectionClass($policy))->getMethods();

return collect($methods)->map(fn (ReflectionMethod $method) => [
'key' => $method->getName(),
'uri' => LspHelper::relativePath($method->getFileName()),
'policy' => is_string($policy) ? $policy : get_class($policy),
'model' => $model,
'line' => $method->getStartLine(),
])->filter(fn ($ability) => !in_array($ability['key'], ['allow', 'deny']));
}

echo json_encode([
'authenticatable' => vsCodeGetAuthenticatable(),
'policies' => collect(Gate::abilities())
->map(function ($policy, $key) {
$reflection = new ReflectionFunction($policy);
$policyClass = null;
$closureThis = $reflection->getClosureThis();

if ($closureThis !== null) {
if (get_class($closureThis) === Illuminate\Auth\Access\Gate::class) {
$vars = $reflection->getClosureUsedVariables();

if (isset($vars['callback']) && str_contains($vars['callback'], '@')) {
[$policyClass, $method] = explode('@', $vars['callback']);

if (method_exists($policyClass, $method)) {
$reflection = new ReflectionMethod($policyClass, $method);
}
}
}
}

return [
'key' => $key,
'uri' => LspHelper::relativePath($reflection->getFileName()),
'policy' => $policyClass,
'line' => $reflection->getStartLine(),
];
})
->merge(
collect(Gate::policies())->flatMap(fn ($policy, $model) => vsCodeGetPolicyInfo($policy, $model)),
)
->merge(
$modelPolicies->flatMap(fn ($policy, $model) => vsCodeGetPolicyInfo($policy, $model)),
)
->values()
->groupBy('key')
->map(fn ($item) => $item->map(fn ($i) => Arr::except($i, 'key'))),
]);
}
