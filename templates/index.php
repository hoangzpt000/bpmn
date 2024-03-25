<?php
global $bpmn_uri;
?>

<div class="container">
    <div class="canvas">
        <div id="js-canvas">
            <img onclick="toggleFullscreen()" id="fullscreen-icon" src="<?= $bpmn_uri . '/public/img/fullscreen.png' ?>">
            <div id="editor">
                <div id="close-button">
                    <!-- <i id="close-icon" class="fa-circle-xmark" style="color: #ffffff;"></i> -->
                    <img onclick="closeNodeContent()" id="close-icon" src="<?= $bpmn_uri . '/public/img/cancel.png' ?>">
                </div>
                <h3 class="editor-text-header"> THÔNG TIN CỦA NODE </h3>
                <div id="main-editor"></div>
            </div>
            <div class="in-out">
                <div class="image-container">
                    <img id="zoomout-icon" src="<?= $bpmn_uri . '/public/img/magnifying-glass.png' ?>" alt="">
                    <img id="reset-icon" src="<?= $bpmn_uri . '/public/img/reset.png' ?>" alt="">
                    <img id="zoomin-icon" src="<?= $bpmn_uri . '/public/img/zoom-in.png' ?>" alt="">
                </div>
            </div>
        </div>
    </div>

</div>