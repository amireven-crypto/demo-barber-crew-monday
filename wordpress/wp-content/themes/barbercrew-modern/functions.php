<?php
/**
 * The Barber Crew – Modern (Child-Theme von Colibri WP)
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

define( 'BC_TREATWELL_URL', 'https://buchung.treatwell.at/ort/the-barber-crew/' );

add_action( 'after_setup_theme', function () {
	add_theme_support( 'title-tag' );
	add_theme_support( 'align-wide' );
	add_theme_support( 'editor-styles' );
	add_editor_style( 'assets/css/barbercrew.css' );
} );

/** Die Landing-Vorlage im Seiten-Editor anbieten. */
add_filter( 'theme_page_templates', function ( $templates ) {
	$templates['templates/landing.php'] = 'Barber Crew Landing';
	return $templates;
} );

function bc_is_landing() {
	return is_page_template( 'templates/landing.php' );
}

add_action( 'wp_enqueue_scripts', function () {
	$dir = get_stylesheet_directory_uri();
	$ver = wp_get_theme()->get( 'Version' ) . '.' . max( filemtime( get_stylesheet_directory() . '/assets/css/barbercrew.css' ), filemtime( get_stylesheet_directory() . '/assets/js/barbercrew.js' ) );
	if ( ! bc_is_landing() ) {
		// Normale Unterseiten (Impressum, Datenschutz …) behalten das Colibri-Layout.
		wp_enqueue_style( 'colibri-parent', get_template_directory_uri() . '/style.css', array(), $ver );
		return;
	}
	wp_enqueue_style( 'bc-fonts', 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700&family=Playfair+Display:ital,wght@0,600;0,700;0,900;1,600&display=swap', array(), null );
	wp_enqueue_style( 'barbercrew', $dir . '/assets/css/barbercrew.css', array(), $ver );
	wp_enqueue_script( 'barbercrew', $dir . '/assets/js/barbercrew.js', array(), $ver, true );
}, 20 );

/** Auf der Landing-Seite die Parent-Styles/Skripte von Colibri entfernen (eigenes Layout). */
add_action( 'wp_enqueue_scripts', function () {
	if ( ! bc_is_landing() ) { return; }
	global $wp_styles, $wp_scripts;
	wp_dequeue_style( 'colibri-wp_google_fonts' );
	foreach ( array( $wp_styles, $wp_scripts ) as $reg ) {
		if ( ! $reg ) { continue; }
		foreach ( $reg->queue as $handle ) {
			$src = isset( $reg->registered[ $handle ] ) ? (string) $reg->registered[ $handle ]->src : '';
			if ( strpos( $src, '/themes/colibri-wp/' ) !== false || strpos( $src, 'Muli' ) !== false ) {
				wp_dequeue_style( $handle );
				wp_dequeue_script( $handle );
			}
		}
	}
}, 100 );

/** Pfad zu Theme-Bildern im Inhalt: {{bc}} wird zur Theme-URL (portabel bei Migration). */
add_filter( 'the_content', function ( $content ) {
	return str_replace( '{{bc}}', get_stylesheet_directory_uri() . '/assets', $content );
}, 1 );
add_filter( 'render_block', function ( $html ) {
	return str_replace( '{{bc}}', get_stylesheet_directory_uri() . '/assets', $html );
} );
