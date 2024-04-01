document.addEventListener('DOMContentLoaded', function () {
    // load quill
    const quill = new Quill('#main-editor', {
        readOnly: true,
        theme: 'snow',
    });

    // load bpmnviewer
    var viewer = new BpmnJS({
        container: '#js-canvas',
        height: 600,
    });

    var canvas = viewer.get('canvas');

    // Lấy id sơ đồ từ session
    var diagramId = JSON.parse(sessionStorage.getItem('diagramId'));

    // All variable
    var bpmnFullScreen = document.getElementById('fullscreen-icon');
    var checkFullScreen = false;
    var viewPort = document.querySelector('.viewport');
    var jsCanvas = document.getElementById('js-canvas');
    var bjs = document.querySelector('.bjs-container');

    var container = document.querySelector('.bpmn_container');
    var bpmnCanvas = document.querySelector('.canvas');
    var editor = document.getElementById('editor');    
    
    var closeButton = document.getElementById('close-button');


    getBPMNFile();


    // Lấy dữ liệu xml của file bpmn
    async function getBPMNFile() {

        var apiData = await callAPI(diagramId);
        var BPMNFileName = apiData.thongTinChung.bpmnFileName;
        var nodeList = apiData.thuTucThucHien;

        fetch(`https://api.trolyphapluat.ai/${BPMNFileName}`)
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

                var bpmnLoading = document.getElementById('bpmn-loading-container');
                bpmnLoading.style.display = 'none';

                nodeList.forEach((node) => {
                    addMarkerForNode(node.nodeID);
                })

                viewer.on('element.click', function (event) {
                    var textNodeName = document.getElementById('editor-text-nodename');

                    var nodeId = event.element.id;
                    var nodeName = event.element.businessObject.name;

                    nodeList.forEach(node => {
                        if (nodeId === node.nodeID) {
                            quill.clipboard.dangerouslyPasteHTML(node.nodeContent);
                            textNodeName.innerHTML = nodeName;
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

        var zoomin = document.getElementById('zoomin-icon');
        var zoomout = document.getElementById('zoomout-icon');
        var reset = document.getElementById('reset-icon');
        var fullScreen = document.getElementById('fullscreen-icon');
        var zoom = fitViewport;
        fitDiagram();

        window.addEventListener('resize', function () {
            canvas.zoom('fit-viewport');
            fitViewport = canvas.zoom();
            zoom = fitViewport;
            if (checkFullScreen === false) {
                fitDiagram();
            }
        })

        // fullScreen.addEventListener('click', function() {
        //     setTimeout(function() {
        //         canvas.zoom('fit-viewport');
        //     }, 200);

        //     setTimeout(function() {
        //         canvas.zoom('fit-viewport');
        //         fitViewport = canvas.zoom();
        //         zoom = fitViewport;
        //     }, 250);
        // });


        fullScreen.addEventListener('click', function() {
            if (checkFullScreen === false) {
                checkFullScreen = true;
            } else {
                checkFullScreen = false;
            }
            BPMNFullScreen(checkFullScreen);
            canvas.zoom('fit-viewport');

            setTimeout(() => {
                canvas.zoom('fit-viewport');
                fitViewport = canvas.zoom();
                zoom = fitViewport;
                if (checkFullScreen === false) {
                    fitDiagram();
                }
            }, 200);
        })

        zoomin.addEventListener('click', function () {
            if (zoom < fitViewport*1.8) {
                zoom += fitViewport/7;
                canvas.zoom(zoom);
            }
        })
        zoomout.addEventListener('click', function () {
            if (zoom > fitViewport/4) {
                zoom -= fitViewport/7;
                canvas.zoom(zoom);
            }
        })
        reset.addEventListener('click', function () {
            canvas.zoom('fit-viewport');
            zoom = fitViewport;
        })
    }

    // Show dữ liệu của node
    function showNodeContent() {
        closeButton.style.display = 'block'
        editor.classList.add('show');
    }

    // Thêm hightlight màu sắc khi node có dữ liệu
    function addMarkerForNode(nodeID) {
        var canvas = viewer.get('canvas');
        canvas.addMarker(nodeID, 'highlight');
    }

    // Add watermark
    var bjs = document.getElementsByClassName('bjs-container');
    for (var i = 0; i < bjs.length; i++) {
        var bjsDiv = document.createElement('div');
        bjsDiv.classList.add('watermark');
        bjs[i].appendChild(bjsDiv);
    }

    // fix lỗi editor
    setTimeout(function() {
        editor.style.opacity = '0.9';
    }, 750);


    function BPMNFullScreen(checkFullScreen) {
        var bjs = document.querySelector('.bjs-container');

        if (checkFullScreen === true) {

            container.style.position = 'fixed';
            container.style.top = '0';
            container.style.left = '0';
            container.style.height = '100vh';
            container.style.width = '100vw';
            container.style.backgroundColor = '#cccccc';  
            container.style.zIndex = '1000';  
        
            bpmnCanvas.style.height = '100%'
            bpmnCanvas.style.width = '100%'
        
            jsCanvas.style.height = '100%'
            jsCanvas.style.width = '100%'
        
            if (window.innerWidth < 768) {
                bjs.style.transform = 'rotate(90deg)';
                bjs.style.transformOrigin = 'bottom left';
                bjs.style.position = 'absolute';
                bjs.style.top = '-100vw';
                bjs.style.height = '100vw';
                bjs.style.width = '100vh';

                editor.style.width = '100vw';
                editor.style.height = '100vw';
                editor.style.rotate = '90deg';
                editor.style.transform = 'translateX(-100%)';
                editor.style.opacity = '0';

                bpmnFullScreen.style.bottom = 0;
                bpmnFullScreen.style.right = 0;

                setTimeout(function() {
                    editor.style.opacity = '0.9';
                }, 750);
            
            } else {
                bjs.style.height = '100%'
                bjs.style.width = '100%'
            }
        } else {
            container.removeAttribute('style');
            jsCanvas.style.height = '600px';
            bjs.style.height = '600px';
            bjs.style.width = '100%';
            bjs.style.position = 'relative';
            bjs.style.removeProperty('transform');
            bjs.style.removeProperty('transform-origin');
            bjs.style.removeProperty('top');

            editor.style.width = '70%';
            editor.style.height = '100%';
            editor.style.removeProperty('rotate');
            editor.style.transform = 'translateX(100%)';
            editor.style.opacity = '0';

            bpmnFullScreen.style.removeProperty('bottom');
            bpmnFullScreen.style.right = '20px';

            setTimeout(function() {
                editor.style.opacity = '0.9';
            }, 750);
        }
    }

    function fitDiagram() {
        var bjs = document.querySelector('.bjs-container');
        var bpmnHeight = viewPort.getBoundingClientRect().height;
        
        jsCanvas.style.height = (bpmnHeight + 30) + 'px';
        bjs.style.height = '100%';
    }

    // Esc close fullscreen
    document.addEventListener("keydown", function(event) {
        if (event.key === "Escape") {
            if (checkFullScreen === true) {
                bpmnFullScreen.click();
            }
        }
    });

    window.addEventListener("orientationchange", (event) => {
        event.preventDefault();
        canvas.zoom("fit-viewport");
        setTimeout(() => {
            canvas.zoom('fit-viewport');
        }, 200)
    })
});

// Đóng dữ liệu của node
function closeNodeContent() {
    var editor = document.getElementById('editor');
    var closeIcon = document.getElementById('close-icon');
    var closeButton = document.getElementById('close-button');

    closeButton.style.display = 'none';
    editor.classList.remove('show');
}


// function toggleFullscreen() {
//     var container = document.getElementById('js-canvas');
//     var bjs = document.getElementsByClassName('bjs-container');
//     if (isFullscreen()) {
//         exitFullscreen(bjs);
//     } else {
//         requestFullscreen(container);

//         if (window.innerWidth < 768) {
//             for (var i = 0; i < bjs.length; i++) {
//                 bjs[i].style.transform = 'rotate(90deg)';
//                 bjs[i].style.transformOrigin = 'bottom left';
//                 bjs[i].style.position = 'absolute';
//                 bjs[i].style.top = '-100vw';
//                 bjs[i].style.height = '100vw';
//                 bjs[i].style.width = '100vh';
//             }
//         } else {
//             for (var i = 0; i < bjs.length; i++) {
//                 bjs[i].style.height = '100%';
//                 bjs[i].style.width = '100%';
//             }
//         }
//     }
// }

// function isFullscreen() {
//     return (
//         document.fullscreenElement ||
//         document.mozFullScreenElement ||
//         document.webkitFullscreenElement ||
//         document.msFullscreenElement
//     );
// }

// function requestFullscreen(element) {
//     if (element.requestFullscreen) {
//         element.requestFullscreen();
//     } else if (element.mozRequestFullScreen) { // Firefox
//         element.mozRequestFullScreen();
//     } else if (element.webkitRequestFullscreen) { // Chrome, Safari and Opera
//         element.webkitRequestFullscreen();
//     } else if (element.msRequestFullscreen) { // IE/Edge
//         element.msRequestFullscreen();
//     }
// }


// function exitFullscreen(bjs) {
//     if (document.exitFullscreen) {
//         for (var i = 0; i < bjs.length; i++) {
//             bjs[i].style.height = '600px';
//             bjs[i].style.width = '100%';
//             bjs[i].style.position = 'relative';
//             bjs[i].style.removeProperty('transform');
//             bjs[i].style.removeProperty('transform-origin');
//             bjs[i].style.removeProperty('top');
//         }

//         if (window.innerWidth > 768 ) {
//             setTimeout(function() {
//                 window.scrollTo(0, 0);
//             }, 100)

//             setTimeout(function() {
//                 var bpmnFullScreen = document.getElementById('fullscreen-icon')
//                 var position = bpmnFullScreen.getBoundingClientRect();
//                 window.scrollTo(0, position.top);
//             }, 200)
//         }

//         document.exitFullscreen();
//     } else if (document.mozCancelFullScreen) { // Firefox
//         document.mozCancelFullScreen();
//     } else if (document.webkitExitFullscreen) { // Chrome, Safari and Opera
//         document.webkitExitFullscreen();
//     } else if (document.msExitFullscreen) { // IE/Edge
//         document.msExitFullscreen();
//     }
// }

