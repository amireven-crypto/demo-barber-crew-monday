<?php
/**
 * Template Name: Barber Crew Landing
 * Template Post Type: page
 */
$bc = get_stylesheet_directory_uri() . '/assets';
?><!doctype html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="The Barber Crew – Barbershop in Wien, Taborstraße 20, 1020 Wien. Haarschnitt, Bart, Rasur. Termin online buchen.">
<script>document.documentElement.classList.add("js");</script>
<?php wp_head(); ?>
</head>
<body <?php body_class( 'bc-landing' ); ?>>
<?php wp_body_open(); ?>
<a class="bc-skip" href="#inhalt">Zum Inhalt springen</a>
<header class="bc-header" id="top">
	<div class="bc-header__inner">
		<a class="bc-header__logo" href="<?php echo esc_url( home_url( '/' ) ); ?>" aria-label="The Barber Crew – Startseite">
			<img src="<?php echo esc_url( $bc . '/img/logo-white.png' ); ?>" alt="The Barber Crew" width="140" height="70">
		</a>
		<nav class="bc-nav" aria-label="Hauptnavigation">
			<a href="#mission">Über uns</a>
			<a href="#preise">Leistungen &amp; Preise</a>
			<a href="#portfolio">Portfolio</a>
			<a href="#bewertungen">Bewertungen</a>
			<a href="#kontakt">Kontakt</a>
		</nav>
		<a class="bc-tel bc-header__tel" href="tel:+4319553551" aria-label="Telefon: +43 1 955 35 51"><span class="bc-tel__label">Telefon</span> <span class="bc-tel__num">+43 1 955 35 51</span></a>
		<a class="bc-btn bc-btn--solid bc-header__cta" href="<?php echo esc_url( BC_TREATWELL_URL ); ?>" target="_blank" rel="noopener">Termin buchen</a>
		<button class="bc-burger" aria-label="Menü öffnen" aria-expanded="false"><span></span><span></span></button>
	</div>
</header>
<main id="inhalt" class="bc-main">
<?php
while ( have_posts() ) {
	the_post();
	the_content();
}
?>
</main>
<footer class="bc-footer">
	<div class="bc-footer__inner">
		<img src="<?php echo esc_url( $bc . '/img/logo-white.png' ); ?>" alt="The Barber Crew" width="120" height="60" loading="lazy">
		<p>© <?php echo esc_html( date( 'Y' ) ); ?> The Barber Crew · Taborstraße 20/G3, 1020 Wien</p>
		<a class="bc-tel bc-footer__tel" href="tel:+4319553551"><span class="bc-tel__label">Telefon</span> <span class="bc-tel__num">+43 1 955 35 51</span></a>
		<nav aria-label="Rechtliches">
			<a href="https://barber-crew.at/impressum/">Impressum</a>
			<a href="https://barber-crew.at/datenschutzerklaerung/">Datenschutzerklärung</a>
		</nav>
	</div>
</footer>
<a class="bc-sticky-book bc-btn bc-btn--solid" href="<?php echo esc_url( BC_TREATWELL_URL ); ?>" target="_blank" rel="noopener">Termin buchen</a>
<?php wp_footer(); ?>
</body>
</html>
