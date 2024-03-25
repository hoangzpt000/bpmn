<?php
/*
    * Plugin Name:       BPMN
    * Description:       Add BPMN diagram to theme.
    * Version:           1.0.0
    * Requires at least: 5.2
    * Requires PHP:      7.2
    * Author:            HoangNV
    * Author URI:        https://author.example.com/
    * License:           GPL v2 or later
    * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
    * Update URI:        https://example.com/my-plugin/
    * Text Domain:       my-basics-plugin
    * Domain Path:       /languages 
*/

global $bpmn_uri;
$bpmn_uri = plugin_dir_url(__FILE__);
global $bpmn_path;
$bpmn_path = plugin_dir_path(__FILE__);

add_action('after_setup_theme', 'add_bpmn_shortcode_to_theme');

function add_bpmn_shortcode_to_theme()
{
    add_shortcode('bpmn_shortcode', 'add_bpmn_shortcode');
}

function add_bpmn_shortcode($arr)
{
    global $bpmn_path;

    enqueue_bpmn_resources();

    ob_start();

    // Lưu id của biểu đồ vào session
    echo '<script type="text/javascript">';
    echo 'sessionStorage.setItem("diagramId", ' . json_encode($arr['id']) . ');';
    echo '</script>';
    require $bpmn_path . '/templates/index.php';


    return ob_get_clean();
}

function enqueue_bpmn_resources()
{
    global $bpmn_uri;
    //CSS
    wp_enqueue_style('bpmn-main-css', $bpmn_uri . '/public/css/bpmn.css');
    wp_enqueue_style('bpmnjs-css', $bpmn_uri . '/public/css/bpmn-js.css');
    wp_enqueue_style('diagramjs-css', $bpmn_uri . '/public/css/diagram-js.css');
    wp_enqueue_style('quill-css', $bpmn_uri . '/public/css/quill.snow.css');
    wp_enqueue_style('bpmn-fontawesome-css', $bpmn_uri . '/public/css/fontawesome.min.css');

    //JS
    // wp_enqueue_script('bpmnjs', $bpmn_uri . '/public/js/bpmn-viewer.development.js');
    wp_enqueue_script('bpmn-navigated-js', $bpmn_uri . '/public/js/bpmn-navigated-viewer.development.js');
    wp_enqueue_script('quill-js', $bpmn_uri . '/public/js/quill.js');
    wp_enqueue_script('bpmn-main-js', $bpmn_uri . '/public/js/scripts.js');
    wp_enqueue_script('GSAP-js', $bpmn_uri . '/public/js/gsap.min.js');
    wp_enqueue_script('fontawesome-js', $bpmn_uri.'/public/js/fontawsome.min.js');
}


register_deactivation_hook(__FILE__, 'bpmn_remove_shortcode');

function bpmn_remove_shortcode()
{
    remove_shortcode('bpmn_shortcode');
}
