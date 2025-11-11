<?php
/**
 * Header HTML com meta tags dinâmicas e SEO
 */

// Garante que config foi carregado
if (!defined('SITE_URL')) {
    require_once __DIR__ . '/../config/config.php';
}

$current_page = getCurrentPage();
$meta = getMetaTags($current_page);

// Função auxiliar para gerar schema JSON-LD
function generateOrganizationSchema() {
    return [
        '@context' => 'https://schema.org',
        '@type' => 'LocalBusiness',
        '@id' => SITE_URL . '/#organization',
        'name' => BUSINESS_NAME,
        'alternateName' => BUSINESS_FULL_NAME,
        'description' => BUSINESS_DESCRIPTION,
        'url' => SITE_URL,
        'image' => SITE_URL . '/images/logo.png',
        'logo' => [
            '@type' => 'ImageObject',
            'url' => SITE_URL . '/images/logo.png',
            'width' => 300,
            'height' => 85
        ],
        'telephone' => BUSINESS_PHONE,
        'email' => BUSINESS_EMAIL,
        'sameAs' => [
            SOCIAL_FACEBOOK,
            SOCIAL_INSTAGRAM,
            SOCIAL_LINKEDIN
        ],
        'address' => getAddressSchema(),
        'areaServed' => [
            'São Paulo',
            'ABCD',
            'Zona Norte',
            'Zona Sul',
            'Zona Leste',
            'Zona Oeste'
        ],
        'priceRange' => '$$',
        'openingHoursSpecification' => [
            '@type' => 'OpeningHoursSpecification',
            'dayOfWeek' => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            'opens' => BUSINESS_HOURS_START,
            'closes' => BUSINESS_HOURS_END
        ]
    ];
}

function generateServiceSchema() {
    return [
        '@context' => 'https://schema.org',
        '@type' => 'Service',
        'serviceType' => 'Aluguel de Carros Executivos com Motorista',
        'provider' => [
            '@type' => 'LocalBusiness',
            'name' => BUSINESS_NAME,
            'url' => SITE_URL
        ],
        'areaServed' => 'São Paulo, SP',
        'offers' => [
            '@type' => 'Offer',
            'priceCurrency' => 'BRL',
            'availability' => 'https://schema.org/InStock'
        ]
    ];
}

?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    
    <!-- SEO Básico -->
    <title><?php echo sanitizeAttr($meta['title']); ?></title>
    <meta name="description" content="<?php echo sanitizeAttr($meta['description']); ?>">
    <meta name="keywords" content="<?php echo sanitizeAttr($meta['keywords']); ?>">
    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
    <meta name="googlebot" content="index, follow">
    <meta name="language" content="Portuguese">
    <meta name="revisit-after" content="7 days">
    <meta name="author" content="<?php echo BUSINESS_NAME; ?>">
    
    <!-- Canonical URL -->
    <link rel="canonical" href="<?php echo SITE_URL . '/' . $current_page; ?>">
    
    <!-- Open Graph (Social Media) -->
    <meta property="og:title" content="<?php echo sanitizeAttr($meta['title']); ?>">
    <meta property="og:description" content="<?php echo sanitizeAttr($meta['description']); ?>">
    <meta property="og:url" content="<?php echo SITE_URL . $_SERVER['REQUEST_URI']; ?>">
    <meta property="og:image" content="<?php echo SITE_URL . $meta['image']; ?>">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:type" content="website">
    <meta property="og:locale" content="pt_BR">
    <meta property="og:site_name" content="<?php echo BUSINESS_NAME; ?>">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="<?php echo sanitizeAttr($meta['title']); ?>">
    <meta name="twitter:description" content="<?php echo sanitizeAttr($meta['description']); ?>">
    <meta name="twitter:image" content="<?php echo SITE_URL . $meta['image']; ?>">
    <meta name="twitter:creator" content="@executivecarsp">
    
    <!-- WhatsApp Meta -->
    <meta property="whatsapp:phone_number_country_code" content="55">
    <meta property="whatsapp:phone_number" content="11989178312">
    
    <!-- Favicons -->
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">
    <link rel="manifest" href="/site.webmanifest">
    
    <!-- DNS Prefetch para performance -->
    <link rel="dns-prefetch" href="//fonts.googleapis.com">
    <link rel="dns-prefetch" href="//cdn.jsdelivr.net">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    
    <!-- Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Montserrat:wght@600;700&display=swap" rel="stylesheet">
    
    <!-- Stylesheets -->
    <link rel="stylesheet" href="/css/bootstrap.min.css">
    <link rel="stylesheet" href="/css/fontawesome.min.css">
    <link rel="stylesheet" href="/css/style.css" media="all">
    
    <!-- Schema.org JSON-LD -->
    <script type="application/ld+json">
    <?php echo json_encode(generateOrganizationSchema(), JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT); ?>
    </script>
    
    <script type="application/ld+json">
    <?php echo json_encode(generateServiceSchema(), JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT); ?>
    </script>
    
    <!-- Breadcrumb Schema -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Início",
                "item": "<?php echo SITE_URL; ?>"
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "<?php echo ucfirst(str_replace('-', ' ', $current_page)); ?>",
                "item": "<?php echo SITE_URL . '/' . $current_page; ?>"
            }
        ]
    }
    </script>
    
    <!-- Google Analytics (substitua pelo seu ID) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
    <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    // gtag('config', 'G-XXXXXXXXXX');
    </script>
    
    <!-- Estrutura JSON para Contact Page -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "ContactPoint",
        "contactType": "Customer Service",
        "telephone": "<?php echo BUSINESS_PHONE; ?>",
        "email": "<?php echo BUSINESS_EMAIL; ?>",
        "areaServed": "BR",
        "availableLanguage": ["pt-BR", "en"]
    }
    </script>
    
    <!-- Preload críticos -->
    <link rel="preload" as="font" href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" crossorigin>
    
    <!-- Inline CSS crítico (opcional) -->
    <style>
        /* Critical CSS para Above-the-fold content */
        body {
            margin: 0;
            padding: 0;
            font-family: 'Roboto', sans-serif;
            color: #333;
        }
        .header-area-1 {
            background: #fff;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
    </style>
</head>
<body>
