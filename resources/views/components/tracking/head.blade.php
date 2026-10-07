@props(['integrations'])

@php
    $googleTag = $integrations->get('google_tag');
    $googleAds = $integrations->get('google_ads');
    $googleTagManager = $integrations->get('google_tag_manager');
    $googleSearchConsole = $integrations->get('google_search_console');
    $metaPixel = $integrations->get('meta_pixel');
    $tiktokPixel = $integrations->get('tiktok_pixel');
    $linkedinInsight = $integrations->get('linkedin_insight');
    $xPixel = $integrations->get('x_pixel');
    $snapchatPixel = $integrations->get('snapchat_pixel');
    $pinterestTag = $integrations->get('pinterest_tag');
    $microsoftClarity = $integrations->get('microsoft_clarity');
    $isCustom = fn (?array $integration): bool => data_get($integration, 'installation_method') === 'custom';
    $managedGoogleDestinations = collect([$googleTag, $googleAds])
        ->filter(fn (?array $integration): bool => $integration !== null && ! $isCustom($integration))
        ->values();
@endphp

@foreach ($integrations as $customIntegration)
    @if ($isCustom($customIntegration) && filled(data_get($customIntegration, 'head_code')))
        <meta
            data-tracking-provider="{{ $customIntegration['platform'] }}"
            data-tracking-installation="custom"
        >
        {!! $customIntegration['head_code'] !!}
    @endif
@endforeach

@if ($googleSearchConsole && ! $isCustom($googleSearchConsole))
    <meta
        name="google-site-verification"
        content="{{ $googleSearchConsole['tracking_id'] }}"
        data-tracking-provider="google_search_console"
    >
@endif

@if ($googleTagManager && ! $isCustom($googleTagManager))
    <script data-tracking-provider="google_tag_manager">
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer',@js($googleTagManager['tracking_id']));
    </script>
@endif

@if ($managedGoogleDestinations->isNotEmpty())
    @foreach ($managedGoogleDestinations as $googleDestination)
        <meta
            data-tracking-provider="{{ $googleDestination['platform'] }}"
            data-tracking-installation="managed"
        >
    @endforeach
    <script
        async
        src="https://www.googletagmanager.com/gtag/js?id={{ rawurlencode($managedGoogleDestinations->first()['tracking_id']) }}"
        data-tracking-provider="google"
    ></script>
    <script data-tracking-provider="google">
        window.dataLayer = window.dataLayer || [];
        window.gtag = window.gtag || function(){window.dataLayer.push(arguments);};
        window.gtag('js', new Date());
        @foreach ($managedGoogleDestinations as $googleDestination)
            window.gtag('config', @js($googleDestination['tracking_id']));
        @endforeach
    </script>
@endif

@if ($metaPixel && ! $isCustom($metaPixel))
    <script data-tracking-provider="meta_pixel">
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window,document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', @js($metaPixel['tracking_id']));
        fbq('track', 'PageView');
    </script>
@endif

@if ($tiktokPixel && ! $isCustom($tiktokPixel))
    <script data-tracking-provider="tiktok_pixel">
        !function (w, d, t) {
            w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
            ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"];
            ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
            for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
            ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
            ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;
            ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=r;ttq._t=ttq._t||{};ttq._t[e]=+new Date;
            ttq._o=ttq._o||{};ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript";n.async=!0;
            n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
            ttq.load(@js($tiktokPixel['tracking_id']));
            ttq.page();
        }(window, document, 'ttq');
    </script>
@endif

@if ($linkedinInsight && ! $isCustom($linkedinInsight))
    <script data-tracking-provider="linkedin_insight">
        window._linkedin_partner_id = @js($linkedinInsight['tracking_id']);
        window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
        window._linkedin_data_partner_ids.push(window._linkedin_partner_id);
        (function(l) {
            if (!l) {
                window.lintrk = function(a,b){window.lintrk.q.push([a,b]);};
                window.lintrk.q = [];
            }
            var s = document.getElementsByTagName("script")[0];
            var b = document.createElement("script");
            b.type = "text/javascript";
            b.async = true;
            b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
            s.parentNode.insertBefore(b, s);
        })(window.lintrk);
    </script>
@endif

@if ($xPixel && ! $isCustom($xPixel))
    <script data-tracking-provider="x_pixel">
        !function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?
        s.exe.apply(s,arguments):s.queue.push(arguments);},s.version='1.1',
        s.queue=[],u=t.createElement(n),u.async=!0,u.src='https://static.ads-twitter.com/uwt.js',
        a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}
        (window,document,'script');
        twq('config', @js($xPixel['tracking_id']));
    </script>
@endif

@if ($snapchatPixel && ! $isCustom($snapchatPixel))
    <script data-tracking-provider="snapchat_pixel">
        (function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function()
        {a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};
        a.queue=[];var s='script';var r=t.createElement(s);r.async=!0;
        r.src=n;var u=t.getElementsByTagName(s)[0];
        u.parentNode.insertBefore(r,u);})(window,document,
        'https://sc-static.net/scevent.min.js');
        snaptr('init', @js($snapchatPixel['tracking_id']));
        snaptr('track', 'PAGE_VIEW');
    </script>
@endif

@if ($pinterestTag && ! $isCustom($pinterestTag))
    <script data-tracking-provider="pinterest_tag">
        !function(e){if(!window.pintrk){window.pintrk=function(){window.pintrk.queue.push(
        Array.prototype.slice.call(arguments))};var n=window.pintrk;n.queue=[],n.version="3.0";
        var t=document.createElement("script");t.async=!0,t.src=e;var r=document.getElementsByTagName("script")[0];
        r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");
        pintrk('load', @js($pinterestTag['tracking_id']));
        pintrk('page');
    </script>
@endif

@if ($microsoftClarity && ! $isCustom($microsoftClarity))
    <script data-tracking-provider="microsoft_clarity">
        (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window,document,"clarity","script",@js($microsoftClarity['tracking_id']));
    </script>
@endif
