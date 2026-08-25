<?php

declare(strict_types=1);

namespace App\Enums;

enum TrackingInstallationMethod: string
{
    case Managed = 'managed';
    case Custom = 'custom';
}
