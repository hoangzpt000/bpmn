<?php
global $bpmn_uri;
?>

<div class="bpmn_container">
    <div class="canvas">
        <div id="js-canvas">
            <img id="fullscreen-icon" src="<?= $bpmn_uri . '/public/img/fullscreen.png' ?>">
            <div class="in-out">
                <div class="image-container">
                    <i class="fa-solid fa-magnifying-glass-minus" id="zoomout-icon"></i>
                    <i class="fa-solid fa-arrows-rotate" id="reset-icon"></i>
                    <i class="fa-solid fa-magnifying-glass-plus" id="zoomin-icon"></i>
                </div>
            </div>
        </div>
    </div>
    <div id="bpmn-loading-container">
        <div class="loading"></div>
    </div>
</div>
<div id="editor">
    <div id="close-button">
        <img onclick="closeNodeContent()" id="close-icon" src="<?= $bpmn_uri . '/public/img/cancel.png' ?>">
    </div>
    <h3 class="editor-text-header"> THÔNG TIN CỦA BƯỚC: </h3>
    <p id="editor-text-nodename">  </p>
    <div id="main-editor"></div>
</div>