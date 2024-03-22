document.addEventListener('DOMContentLoaded', function () {
    // load quill
    const quill = new Quill('#main-editor', {
        readOnly: true,
        theme: 'snow',
    });

    // load bpmnviewer
    var viewer = new BpmnJS({
        container: '#js-canvas',
        height: 600
    });

    var canvas = viewer.get('canvas');

    // Lấy id sơ đồ từ session
    var diagramId = JSON.parse(sessionStorage.getItem('diagramId'));

    getBPMNFile();


    // Lấy dữ liệu xml của file bpmn
    async function getBPMNFile() {

        var apiData = await callAPI(diagramId);
        var BPMNFileName = apiData.thongTinChung.bpmnFileName;
        var nodeList = apiData.thuTucThucHien;

        fetch(`https://apis.trolyphapluat.ai/${BPMNFileName}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.blob();
            })
            .then(blobData => {
                const reader = new FileReader();
                reader.onload = function (e) {
                    var content = e.target.result;
                    drawDiagram(content, nodeList);
                };
                reader.readAsText(blobData);
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });
    }

    // Vẽ đồ thị
    async function drawDiagram(XMLContent, nodeList) {
        await viewer.importXML(XMLContent)
            .then(async function () {

                nodeList.forEach((node) => {
                    addMarkerForNode(node.nodeID);
                })

                viewer.on('element.click', function (event) {

                    var nodeId = event.element.id;
                    var nodeName = event.element.businessObject.name;

                    nodeList.forEach(node => {
                        if (nodeId === node.nodeID) {
                            quill.clipboard.dangerouslyPasteHTML(node.nodeContent);
                            showNodeContent();
                        }
                    });

                })

            })
            .catch(function (err) {
                console.error("Failed to load diagram");
                console.error(err);
            });

        // căn chỉnh kích thước và xử lí zoom
        diagramResize();
    }

    // Call API
    async function callAPI(diagramID) {
        const apiURL = `https://apis.trolyphapluat.ai/detail/${diagramID}`;

        try {

            const response = await fetch(apiURL);

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            return data.result;

        } catch (error) {
            throw error;
        }

    }

    function diagramResize() {
        canvas.zoom('fit-viewport');
        var fitViewport = canvas.zoom();

        function updateVariables() {
            zoom = fitViewport;
            step = fitViewport / 7;
        }

        var zoomin = document.getElementById('zoomin-icon');
        var zoomout = document.getElementById('zoomout-icon');
        var reset = document.getElementById('reset-icon');
        var zoom = fitViewport;
        var step = fitViewport / 7;

        window.addEventListener('resize', function () {
            canvas.zoom('fit-viewport');
            fitViewport = canvas.zoom();
            updateVariables();
        })

        zoomin.addEventListener('click', function () {
            zoom += step;
            canvas.zoom(zoom);
        })
        zoomout.addEventListener('click', function () {
            zoom -= step;
            canvas.zoom(zoom);
        })
        reset.addEventListener('click', function () {
            canvas.zoom('fit-viewport');
            zoom = fitViewport;
        })
    }

    document.addEventListener('keydown', function(event) {
        if (event.key === "Escape" || event.key === "Esc") {
            event.preventDefault();
            console.log('Đã nhấn phím Escape');
        }
    });

    // Show dữ liệu của node
    function showNodeContent() {
        var editor = document.getElementById('editor');
        var closeButton = document.getElementById('close-button');
        closeButton.style.display = 'block'
        editor.classList.add('show');
    }

    // Thêm hightlight màu sắc khi node có dữ liệu
    function addMarkerForNode(nodeID) {
        var canvas = viewer.get('canvas');
        canvas.addMarker(nodeID, 'highlight');
    }

    var bjs = document.getElementsByClassName('bjs-container');
    for (var i = 0; i < bjs.length; i++) {
        var bjsDiv = document.createElement('div');
        bjsDiv.classList.add('watermark');
        bjs[i].appendChild(bjsDiv);
    }

});

// Đóng dữ liệu của node
function closeNodeContent() {
    var editor = document.getElementById('editor');
    var closeIcon = document.getElementById('close-icon');
    var closeButton = document.getElementById('close-button');

    closeIcon.addEventListener('click', function () {
        closeButton.style.display = 'none';
        editor.classList.remove('show');
    });
}


function toggleFullscreen() {
    var container = document.getElementById('js-canvas');
    var bjs = document.getElementsByClassName('bjs-container');
    if (isFullscreen()) {
        exitFullscreen(bjs);
    } else {
        requestFullscreen(container);
        for (var i = 0; i < bjs.length; i++) {
            // bjs[i].style.height = '100%';
            // bjs[i].style.width = '100%';
            bjs[i].style.transform = 'rotate(90deg)';
            bjs[i].style.transformOrigin = 'bottom left';
            bjs[i].style.position = 'absolute';
            bjs[i].style.top = '-100vw';
            bjs[i].style.height = '100vw';
            bjs[i].style.width = '100vh';
        }

    }
}

function isFullscreen() {
    return (
        document.fullscreenElement ||
        document.mozFullScreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement
    );
}

function requestFullscreen(element) {
    if (element.requestFullscreen) {
        element.requestFullscreen();
    } else if (element.mozRequestFullScreen) { // Firefox
        element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) { // Chrome, Safari and Opera
        element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) { // IE/Edge
        element.msRequestFullscreen();
    }
}


function exitFullscreen(bjs) {
    if (document.exitFullscreen) {
        for (var i = 0; i < bjs.length; i++) {
            bjs[i].style.height = '600px';
            bjs[i].style.width = '100%';
            bjs[i].style.position = 'relative';
            bjs[i].style.removeProperty('transform');
            bjs[i].style.removeProperty('transform-origin');
            bjs[i].style.removeProperty('top');
        }
        console.log(bjs);
        document.exitFullscreen();
    } else if (document.mozCancelFullScreen) { // Firefox
        document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) { // Chrome, Safari and Opera
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { // IE/Edge
        document.msExitFullscreen();
    }
}

