@props(['integrations'])

@php
    $googleTagManager = $integrations->get('google_tag_manager');
    $metaPixel = $integrations->get('meta_pixel');
    $linkedinInsight = $integrations->get('linkedin_insight');
    $pinterestTag = $integrations->get('pinterest_tag');
@endphp

@if ($googleTagManager)
    <noscript data-tracking-provider="google_tag_manager">
        <iframe
            src="https://www.googletagmanager.com/ns.html?id={{ rawurlencode($googleTagManager['tracking_id']) }}"
            height="0"
            width="0"
            class="hidden invisible"
            title="Google Tag Manager"
        ></iframe>
    </noscript>
@endif

@if ($metaPixel)
    <noscript data-tracking-provider="meta_pixel">
        <img
            height="1"
            width="1"
            class="hidden"
            src="https://www.facebook.com/tr?id={{ rawurlencode($metaPixel['tracking_id']) }}&ev=PageView&noscript=1"
            alt=""
        >
    </noscript>
@endif

@if ($linkedinInsight)
    <noscript data-tracking-provider="linkedin_insight">
        <img
            height="1"
            width="1"
            class="hidden"
            alt=""
            src="https://px.ads.linkedin.com/collect/?pid={{ rawurlencode($linkedinInsight['tracking_id']) }}&fmt=gif"
        >
    </noscript>
@endif

@if ($pinterestTag)
    <noscript data-tracking-provider="pinterest_tag">
        <img
            height="1"
            width="1"
            class="hidden"
            alt=""
            src="https://ct.pinterest.com/v3/?event=init&tid={{ rawurlencode($pinterestTag['tracking_id']) }}&noscript=1"
        >
    </noscript>
@endif
