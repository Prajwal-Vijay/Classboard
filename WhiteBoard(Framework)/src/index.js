const PDFDocument = require("pdfkit");
var blobStream = require("blob-stream"),
	fs = require("fs"),
	SVGtoPDF = require("svg-to-pdfkit");
const { parse } = require("path");
let intro = document.querySelector(".intro");
let logo = document.querySelector(".logo-header");
let logoSpan = document.querySelectorAll(".logo");
let logoImg = document.querySelector(".logo-img");
var f = function (id) {
	return document.getElementById(id);
};
PDFDocument.prototype.addSVG = function (svg, x, y, options) {
	return SVGtoPDF(this, svg, x, y, options), this;
};
var hasPDF = false;
var drawingModeEl = f("drawing-mode"),
	drawingOptionsEl = f("drawing-mode-options"),
	drawingColorEl = f("drawing-color"),
	drawingShadowColorEl = f("drawing-shadow-color"),
	drawingLineWidthEl = f("drawing-line-width"),
	drawingShadowWidth = f("drawing-shadow-width"),
	drawingShadowOffset = f("drawing-shadow-offset"),
	selectabler = f("selectable"),
	clearEl = f("clear-canvas"),
	downloadE1 = f("download-canvas"),
	saveCanvasE1 = f("save-canvas"),
	openCanvasE1 = f("open-canvas"),
	videoAddE1 = f("video-canvas"),
	downloadPdfE1 = f("pdf-canvas"),
	uploadE1 = f("Upload-canvas");
var maxPage = 0;
$(document).ready(function () {
	$("#drawing-mode-selector").select2({
		dropdownCssClass: "myOptions",
		closeOnSelect: true,
	});
});
(function () {
	window.addEventListener("DOMContentLoaded", () => {
		setTimeout(() => {
			setTimeout(() => {
				logoImg.classList.add("active");
			}, 1 * 100);
			logoSpan.forEach((span, idx) => {
				setTimeout(() => {
					span.classList.add("active");
				}, (idx + 1) * 400);
			});

			setTimeout(() => {
				setTimeout(() => {
					logoImg.classList.remove("active");
					logoImg.classList.add("fade");
				}, 1 * 50);
				logoSpan.forEach((span, idx) => {
					setTimeout(() => {
						span.classList.remove("active");
						span.classList.add("fade");
					}, (idx + 1) * 50);
				});
			}, 2000);
			setTimeout(() => {
				intro.style.top = "-100vh";
			}, 3000);
		});
	});
	var $ = function (id) {
		return document.getElementById(id);
	};

	fabric.Object.prototype.toObject = (function (toObject) {
		return function (propertiesToInclude) {
			propertiesToInclude = (propertiesToInclude || []).concat(["video_src"]);
			return toObject.apply(this, [propertiesToInclude]);
		};
	})(fabric.Object.prototype.toObject);
	var canvas = (this.__canvas = new fabric.Canvas("c", {
		isDrawingMode: true,
	}));
	init(canvas);
	var canArray = [];
	var objArray = [];
	var objArray2 = [];
	var mainCanvas = canvas.getElement();
	var mainCtx = mainCanvas.getContext("2d");
	var curCanvas;
	var addedpages = 0;
	uploadE1.onclick = function (e) {
		if ($("to-upload").style.height === "0px") {
			$("to-upload").style.height = "100px";
		} else {
			$("to-upload").style.height = "0px";
		}
	};

	/*This is IMAGE Upload
	 *
	 */

	$("img-upload").onclick = function (e) {
		$("file2").click();
		$("file2").onchange = function (e) {
			const file = $("file2").files[0];
			var filePath = $("file2").value;
			const fileType = file["type"];
			const reader = new FileReader();
			const validImageTypes = ["image/gif", "image/jpeg", "image/png"];
			const validSVG = /(\.svg)$/i;
			if (validImageTypes.includes(fileType)) {
				reader.addEventListener("load", () => {
					fabric.Image.fromURL(reader.result, function (myImg) {
						var img1 = myImg.set({
							left: 0,
							top: 0,
						});
						canvas.add(img1);
					});
				});
				reader.readAsDataURL(this.files[0]);
			} else if (validSVG.exec(filePath)) {
				var url = URL.createObjectURL(file);
				fabric.loadSVGFromURL(url, function (objects, options) {
					var obj = fabric.util.groupSVGElements(objects, options);
					canvas.add(obj).renderAll();
				});
			}
			$("to-upload").style.height = "0px";
		};
	};

	/*This is PDF Upload
	 *
	 */

	var thePDF = null;
	$("pdf-upload").onclick = function (e) {
		$("file1").click();
		$("file1").onchange = function (e) {
			const file = $("file1").files[0];
			const fileType = file["type"];
			const validPdfTypes = ["application/pdf"];
			if (validPdfTypes.includes(fileType)) {
				canvas.offHistory();
				hasPDF = true;
				var loadingTask = pdfjsLib.getDocument(
					URL.createObjectURL(this.files[0])
				);
				loadingTask.promise.then(function (pdf) {
					thePDF = pdf;
					canArray = [];
					objArray = [];
					saveCanvasE1.setAttribute("disabled", true);
					var currPage = 1;
					maxPage = thePDF.numPages;
					for (let i = 0; i < maxPage; i++) {
						objArray.push(null);
					}
					for (let i = 0; i < maxPage; i++) {
						var canvasE1 = document.createElement("canvas");
						canvasE1.style.height = "700px";
						canvasE1.style.width = "1200px";

						canvasE1.style.position = "relative";
						canvasE1.setAttribute("id", "c");

						getPdf(i + 1, canvasE1);
						canArray.push(canvasE1);
						console.log("Done Canvas:" + i);
					}
					var loaded = true;
					$("next-page").innerHTML = "";
					var next = document.createElement("button");
					next.addEventListener("click", function (e) {
						if (currPage == 1 && loaded == true) {
							canvas.clear();
							var bg = canArray[currPage - 1].toDataURL("image/png");
							mainCanvas.style.backgroundImage = "url('')";
							console.log("To Page:" + currPage);
							fabric.Image.fromURL(bg, function (img) {
								canvas.setHeight(canArray[currPage - 1].height);
								canvas.setWidth(canArray[currPage - 1].width);
								mainCanvas.style.height = canArray[currPage - 1].height + "px";
								mainCanvas.style.width = canArray[currPage - 1].width + "px";
								canvas.setBackgroundImage(img);
							});
							canvas.renderAll();
							loaded = false;
							if (maxPage !== 1) {
								this.innerHTML = "NEXT";
							}
						} else if (currPage < maxPage) {
							this.setAttribute("disabled", true);
							setTimeout(function () {
								objArray[currPage - 1] = canvas.toDatalessJSON();
								objArray2[currPage - 1] = canvas.toSVG();
								console.log("Copied:" + currPage);
								currPage++;
								console.log("At:" + currPage);
								console.log(objArray.length);
								mainCanvas.style.background = "transparent";
								canvas.setBackgroundImage(null);
								canvas.clear();
								if (!objArray[currPage - 1]) {
									var bg = canArray[currPage - 1].toDataURL("image/png");

									fabric.Image.fromURL(bg, function (img) {
										canvas.setHeight(canArray[currPage - 1].height);
										canvas.setWidth(canArray[currPage - 1].width);
										mainCanvas.style.height =
											canArray[currPage - 1].height + "px";
										mainCanvas.style.width =
											canArray[currPage - 1].width + "px";
										canvas.setBackgroundImage(img);
									});
								} else {
									canvas.loadFromJSON(
										objArray[currPage - 1],
										canvas.renderAll.bind(canvas)
									);
								}

								canvas.renderAll();
								next.removeAttribute("disabled");
							}, 100);
						}
					});
					next.innerHTML = "START";
					$("next-page").append(next);
					var previous = document.createElement("button");
					previous.addEventListener("click", function () {
						if (currPage > 1) {
							this.setAttribute("disabled", true);
							setTimeout(function () {
								objArray[currPage - 1] = canvas.toDatalessJSON();
								objArray2[currPage - 1] = canvas.toSVG();

								console.log("Copied:" + currPage);
								currPage--;
								console.log("At:" + currPage);
								console.log(objArray.length);
								mainCanvas.style.background = "transparent";
								canvas.setBackgroundImage(null);
								canvas.clear();
								if (!objArray[currPage - 1]) {
									var bg = canArray[currPage - 1].toDataURL("image/png");
									fabric.Image.fromURL(bg, function (img) {
										img.scaleToHeight(canArray[currPage - 1].height);
										img.scaleToWidth(canArray[currPage - 1].width);
										canvas.setHeight(canArray[currPage - 1].height);
										canvas.setWidth(canArray[currPage - 1].width);
										mainCanvas.style.height =
											canArray[currPage - 1].height + "px";
										mainCanvas.style.width =
											canArray[currPage - 1].width + "px";
										canvas.setBackgroundImage(img);
									});
								} else {
									canvas.loadFromJSON(
										objArray[currPage - 1],
										canvas.renderAll.bind(canvas)
									);
								}

								canvas.renderAll();
								previous.removeAttribute("disabled");
							}, 100);
						}
					});
					previous.innerHTML = "PREVIOUS";
					$("next-page").append(previous);
					var input = document.createElement("input");
					input.type = "number";
					input.min = 1;

					input.addEventListener("keypress", function (e) {
						console.log("detected:" + e);
						if (e.key === "Enter") {
							{
								this.setAttribute("disabled", true);
								setTimeout(function () {
									objArray[currPage - 1] = canvas.toDatalessJSON();
									objArray2[currPage - 1] = canvas.toSVG();
									console.log("Copied:" + currPage);
									if (parseInt(input.value) <= maxPage) {
										currPage = parseInt(input.value);
									} else {
										input.removeAttribute("disabled");
										return;
									}
									console.log("At:" + currPage);
									console.log(objArray.length);
									mainCanvas.style.background = "transparent";
									canvas.setBackgroundImage(null);
									canvas.clear();
									if (!objArray[currPage - 1]) {
										var bg = canArray[currPage - 1].toDataURL("image/png");
										fabric.Image.fromURL(bg, function (img) {
											img.scaleToHeight(canArray[currPage - 1].height);
											img.scaleToWidth(canArray[currPage - 1].width);
											canvas.setHeight(canArray[currPage - 1].height);
											canvas.setWidth(canArray[currPage - 1].width);
											mainCanvas.style.height =
												canArray[currPage - 1].height + "px";
											mainCanvas.style.width =
												canArray[currPage - 1].width + "px";
											canvas.setBackgroundImage(img);
										});
									} else {
										canvas.loadFromJSON(
											objArray[currPage - 1],
											canvas.renderAll.bind(canvas)
										);
									}

									canvas.renderAll();
									input.removeAttribute("disabled");
								}, 500);
							}
						}
					});
					$("next-page").append(input);
					var add = document.createElement("button");
					add.addEventListener("click", function () {
						next.innerHTML = "NEXT";
						this.setAttribute("disabled", true);
						setTimeout(function () {
							objArray[currPage - 1] = canvas.toDatalessJSON();
							objArray2[currPage - 1] = canvas.toSVG();
							maxPage++;
							currPage = maxPage;
							mainCanvas.style.background = "transparent";
							canvas.setBackgroundImage(null);
							canvas.clear();
							fabric.Image.fromURL(
								"https://s7d7.scene7.com/is/image/DeluxeForms/20986?wid=800",
								function (img) {
									img.scaleToHeight(1200);
									canvas.setBackgroundImage(img).renderAll();
								}
							);
							canvas.setHeight(1200);
							canvas.renderAll();
							mainCanvas.style.height = "1200px";
							console.log(canvas.toSVG());
							add.removeAttribute("disabled");
						}, 300);
					});
					add.innerHTML = "ADD";
					$("next-page").append(add);
				});
			}
			$("to-upload").style.height = "0px";
		};
	};

	function getPdf(i, canvasE1) {
		thePDF.getPage(i).then(function (page) {
			var scale = 2;
			var viewport = page.getViewport({ scale: scale });

			var context = canvasE1.getContext("2d");
			canvasE1.height = viewport.height;
			canvasE1.width = viewport.width;

			var renderContext = {
				canvasContext: context,
				viewport: viewport,
			};
			page.render(renderContext);
		});
	}

	clearEl.onclick = function () {
		canvas.clear();
		canvas.clearHistory();
		hasPDF = false;
		saveCanvasE1.removeAttribute("disabled");
		$("next-page").innerHTML = "";
		objArray = [];
		canArray = [];
		canvas.getElement().style.backgroundImage =
			"url('/Images/canvas-background.png')";
		canvas.setHeight(700);
		canvas.setWidth(1200);
		canvas.getElement().style.width = 1200;
		canvas.getElement().style.height = 700;
	};
	downloadE1.onclick = function () {
		canvas.getElement().toBlob(function (blob) {
			saveAs(blob, "classBoard.png");
		});
	};
	drawingModeEl.onclick = function () {
		canvas.isDrawingMode = !canvas.isDrawingMode;
		if (canvas.isDrawingMode) {
			drawingModeEl.innerHTML = "Exit";
			$("drawing-mode-options-inner-div").style.height = "160px";
		} else {
			drawingModeEl.innerHTML = "Enter";
			$("drawing-mode-options-inner-div").style.height = "0px";
		}
	};
	saveCanvasE1.onclick = function () {
		var json = canvas.toJSON();
		var name = prompt("Enter the name of the file to be saved");
		localStorage.setItem(name, JSON.stringify(json));
	};
	// $("video-upload").onclick = function () {
	// 	var url = prompt("Enter Video URL");
	// 	var videoE1 = document.createElement("video");
	// 	videoE1.width = 480;
	// 	videoE1.height = 360;
	// 	videoE1.crossOrigin = "anonymous";
	// 	var source = document.createElement("source");
	// 	source.src = url;
	// 	source.type = "video/mp4";
	// 	videoE1.appendChild(source);
	// 	var video1 = new fabric.Image(videoE1, {
	// 		left: 200,
	// 		top: 300,
	// 		angle: -15,
	// 		originX: "center",
	// 		originY: "center",
	// 		objectCaching: false,
	// 	});
	// 	video1.set("video_src", source.src);
	// 	canvas.add(video1);
	// 	video1.on("selected", function () {
	// 		video1.getElement().play();
	// 		fabric.util.requestAnimFrame(function render() {
	// 			canvas.renderAll();
	// 			fabric.util.requestAnimFrame(render);
	// 		});
	// 	});
	// 	video1.getElement().play();
	// 	fabric.util.requestAnimFrame(function render() {
	// 		canvas.renderAll();
	// 		fabric.util.requestAnimFrame(render);
	// 	});
	// };
	downloadPdfE1.onclick = function () {
		const doc = new PDFDocument({
			size: [canArray[0].width + 100, canArray[0].height],
			autoFirstPage: false,
		});
		document.getElementById("waiter").style.display = "block";
		setTimeout(function () {
			const stream = doc.pipe(blobStream());
			for (let i = 0; i < maxPage; i++) {
				doc.addPage({
					useCSS: "false",
					assumePt: "false",
					preserveAspectRatio: "none",
					size: [canArray[i].width + 50, canArray[i].height + 50],
				});
				console.log(objArray[i]);
				if (objArray2[i]) {
					doc.addSVG(objArray2[i], 0, 0, {
						useCSS: "false",
						assumePt: "false",
						preserveAspectRatio: "none",
						size: [canArray[i].width, canArray[i].height],
					});
				} else if (canArray[i]) {
					var img = canArray[i].toDataURL("image/jpeg");
					doc.image(img, 0, 0, {
						useCSS: "false",
						assumePt: "false",
						preserveAspectRatio: "none",
						width: canArray[i].width + 50,
						height: canArray[i].height + 50,
					});
				}
			}
			console.log("Done");
			doc.end();
			console.log("finished");

			stream.on("finish", function () {
				// get a blob you can do whatever you like with
				const blob = stream.toBlob("application/pdf");

				// or get a blob URL for display in the browser
				const url = stream.toBlobURL("application/pdf");
				window.open(url);
				document.getElementById("waiter").style.display = "none";
			});
		}, 100);
	};
	openCanvasE1.onclick = function () {
		var name = prompt("Enter the name of the file to be opened");
		var data = JSON.parse(localStorage.getItem(name));
		canvas = canvas.loadFromJSON(data, canvasLoaded, function (o, object) {
			fabric.log(o, object);
		});

		function canvasLoaded() {
			canvas.renderAll.bind(canvas);
			var objs = data["objects"];
			for (var i = 0; i < objs.length; i++) {
				if (objs[i].hasOwnProperty("video_src")) {
					var videoE = getVideoElement(objs[i]["video_src"]);
					var fab_video = new fabric.Image(videoE, {
						left: objs[i]["left"],
						top: objs[i]["top"],
					});
					canvas.add(fab_video);
					fab_video.getElement().play();
					fabric.util.requestAnimFrame(function render() {
						canvas.renderAll();
						fabric.util.requestAnimFrame(render);
					});
				}
			}
		}
		function getVideoElement(url) {
			var videoE = document.createElement("video");
			videoE.width = 530;
			videoE.height = 298;
			videoE.muted = true;
			videoE.crossOrigin = "anonymous";
			var source = document.createElement("source");
			source.src = url;
			source.type = "video/mp4";
			videoE.appendChild(source);
			return videoE;
		}
	};
})();

function init(canvas) {
	var f = function (id) {
		return document.getElementById(id);
	};
	f("to-upload").style.height = "0px";
	fabric.Object.prototype.transparentCorners = false;
	$(document).bind("contextmenu", function (event) {
		// Avoid the real one
		event.preventDefault();
		//Get window size:
		var winWidth = $(document).width();
		var winHeight = $(document).height();
		//Get pointer position:
		var posX = event.pageX;
		var posY = event.pageY;
		//Get contextmenu size:
		var menuWidth = $(".custom-menu").width();
		var menuHeight = $(".custom-menu").height();
		//Security margin:
		var secMargin = 10;
		//Prevent page overflow:
		if (
			posX + menuWidth + secMargin >= winWidth &&
			posY + menuHeight + secMargin >= winHeight
		) {
			//Case 1: right-bottom overflow:
			posLeft = posX - menuWidth - secMargin + "px";
			posTop = posY - menuHeight - secMargin + "px";
		} else if (posX + menuWidth + secMargin >= winWidth) {
			//Case 2: right overflow:
			posLeft = posX - menuWidth - secMargin + "px";
			posTop = posY + secMargin + "px";
		} else if (posY + menuHeight + secMargin >= winHeight) {
			//Case 3: bottom overflow:
			posLeft = posX + secMargin + "px";
			posTop = posY - menuHeight - secMargin + "px";
		} else {
			//Case 4: default values:
			posLeft = posX + secMargin + "px";
			posTop = posY + secMargin + "px";
		}
		//Display contextmenu:
		$(".custom-menu")
			.css({
				left: posLeft,
				top: posTop,
			})
			.show();
		//Prevent browser default contextmenu.
		return false;
	});

	// If the document is clicked somewhere
	$(document).bind("mousedown", function (e) {
		// If the clicked element is not the menu
		if (!$(e.target).parents(".custom-menu").length > 0) {
			// Hide it
			$(".custom-menu").hide(100);
		}
	});

	// If the menu element is clicked
	$(".custom-menu li").click(function () {
		// This is the triggered action name
		switch ($(this).attr("data-action")) {
			// A case for each action. Your actions here
			case "first":
				canvas.discardActiveObject().renderAll();

				var x = $(".custom-menu").position();
				canvas.getObjects().forEach((obj) => {
					if (
						x.top >= obj.top &&
						x.top <= obj.top + obj.height &&
						x.left >= obj.left &&
						x.left <= obj.left + obj.width
					) {
						obj.selectable = !obj.selectable;
						console.log(obj.selectable);
						return;
					}
				});
				break;
			case "second":
				var objectsInGroup = canvas.getActiveObjects();
				var x = Infinity;
				var y = Infinity;
				objectsInGroup.forEach((obj) => {
					if (Math.abs(obj.left) < x) {
						x = Math.abs(obj.left);
					}
					if (Math.abs(obj.top) < x) {
						y = Math.abs(obj.top);
					}
				});
				var newgroup = new fabric.Group(objectsInGroup, {
					left: x,
					top: y,
				});
				objectsInGroup.forEach(function (object) {
					canvas.remove(object);
				});
				canvas.add(newgroup);
				break;

			case "third":
				var activeObject = canvas.getActiveObject();
				if (activeObject.type == "group") {
					var items = activeObject._objects;
					activeObject._restoreObjectsState();
					canvas.remove(activeObject);
					for (var i = 0; i < items.length; i++) {
						canvas.add(items[i]);
						canvas.item(canvas.size() - 1).hasControls = true;
					}

					canvas.renderAll();
				}
				break;
		}

		// Hide it AFTER the action was triggered
		$(".custom-menu").hide(100);
	});
	document.addEventListener("keyup", ({ keyCode, ctrlKey } = event) => {
		// Check Ctrl key is pressed.
		if (!ctrlKey) {
			return;
		}

		// Check pressed button is Z - Ctrl+Z.
		if (keyCode === 90 && !hasPDF) {
			canvas.undo();
		}

		// Check pressed button is Y - Ctrl+Y.
		if (keyCode === 89 && !hasPDF) {
			canvas.redo();
		}
	});
	document.addEventListener("keydown", KeyCheck, false);
	function KeyCheck(event) {
		var key = event.key;
		if (key === "Delete") {
			console.log("passed");
			canvas.getActiveObjects().forEach((obj) => {
				canvas.remove(obj);
			});
			canvas.discardActiveObject().renderAll();
		}
	}

	document.addEventListener("dblclick", function (e) {
		e.preventDefault();
		if (canvas.findTarget(e) && canvas.findTarget(e).type !== "image") {
			return;
		}
		var textBox = new fabric.IText("click to add text", {
			width: 450,
			left: e.pageX,
			top: e.pageY,
			fill: drawingColorEl.value,
			fontSize: parseInt(drawingLineWidthEl.value),
		});
		canvas.add(textBox).setActiveObject(textBox);
		textBox.enterEditing();
		canvas.renderAll();
	});
	document.addEventListener("keydown", function (event) {
		if (event.altKey && !event.shiftKey) {
			event.preventDefault();
			if (canvas.isDrawingMode) {
				drawingModeEl.click();
			}
		}
	});
	document.addEventListener("keyup", function (event) {
		if ((event.code === "ShiftLeft" || "ShiftRight") && event.altKey) {
			event.preventDefault();
			document.removeEventListener("wheel", wheeler);
		}
	});
	var scrollCount = 30;
	document.addEventListener("keydown", function (event) {
		if (event.shiftKey && event.altKey) {
			event.preventDefault();
			document.addEventListener("wheel", wheeler);
		}
	});

	function wheeler(event) {
		console.log("Got the event");
		if (event.deltaY > 0 && scrollCount <= 150) {
			scrollCount++;
			canvas.freeDrawingBrush.width = scrollCount;
			drawingLineWidthEl.value = scrollCount;
			console.log(drawingLineWidthEl.value);
		} else if (event.deltaY < 0 && scrollCount > 1) {
			scrollCount--;
			canvas.freeDrawingBrush.width = scrollCount;
			drawingLineWidthEl.value = scrollCount;
		}
		drawingLineWidthEl.previousSibling.innerHTML = drawingLineWidthEl.value;
	}

	$(document).keyup(function (event) {
		var key = event.keyCode ? event.keyCode : event.which;
		if (key == "18") {
			event.preventDefault();
			if (!canvas.isDrawingMode) {
				drawingModeEl.click();
			}
		}
	});
	if (fabric.PatternBrush) {
		var vLinePatternBrush = new fabric.PatternBrush(canvas);
		vLinePatternBrush.getPatternSrc = function () {
			var patternCanvas = fabric.document.createElement("canvas");
			patternCanvas.width = patternCanvas.height = 10;
			var ctx = patternCanvas.getContext("2d");

			ctx.strokeStyle = this.color;
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo(0, 0);
			ctx.lineTo(10, 0);
			ctx.closePath();
			ctx.stroke();

			return patternCanvas;
		};

		var hLinePatternBrush = new fabric.PatternBrush(canvas);
		hLinePatternBrush.getPatternSrc = function () {
			var patternCanvas = fabric.document.createElement("canvas");
			patternCanvas.width = patternCanvas.height = 10;
			var ctx = patternCanvas.getContext("2d");

			ctx.strokeStyle = this.color;
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo(5, 0);
			ctx.lineTo(5, 10);
			ctx.closePath();
			ctx.stroke();

			return patternCanvas;
		};

		var squarePatternBrush = new fabric.PatternBrush(canvas);
		squarePatternBrush.getPatternSrc = function () {
			var squareWidth = 10,
				squareExcess = 2;

			var patternCanvas = fabric.document.createElement("canvas");
			patternCanvas.width = patternCanvas.height = squareWidth + squareExcess;
			var ctx = patternCanvas.getContext("2d");

			ctx.fillStyle = this.color;
			ctx.fillRect(0, 0, squareWidth, squareWidth);

			return patternCanvas;
		};

		var diamondPatternBrush = new fabric.PatternBrush(canvas);
		diamondPatternBrush.getPatternSrc = function () {
			var squareWidth = 10,
				squareDistance = 5;
			var patternCanvas = fabric.document.createElement("canvas");
			var rect = new fabric.Rect({
				width: squareWidth,
				height: squareWidth,
				angle: 45,
				fill: this.color,
			});

			var canvasWidth = rect.getBoundingRect().width;
			patternCanvas.width = patternCanvas.height = canvasWidth;
			rect.set({ left: canvasWidth / 2, top: 0 });

			var ctx = patternCanvas.getContext("2d");
			rect.render(ctx);

			return patternCanvas;
		};
	}

	f("drawing-mode-selector").onchange = function () {
		if (this.value === "hline") {
			canvas.freeDrawingBrush = vLinePatternBrush;
		} else if (this.value === "vline") {
			canvas.freeDrawingBrush = hLinePatternBrush;
		} else if (this.value === "square") {
			canvas.freeDrawingBrush = squarePatternBrush;
		} else if (this.value === "diamond") {
			canvas.freeDrawingBrush = diamondPatternBrush;
		} else {
			canvas.freeDrawingBrush = new fabric[this.value + "Brush"](canvas);
		}

		if (canvas.freeDrawingBrush) {
			var brush = canvas.freeDrawingBrush;
			brush.color = drawingColorEl.value;
			if (brush.getPatternSrc) {
				brush.source = brush.getPatternSrc.call(brush);
			}
			brush.width = parseInt(drawingLineWidthEl.value, 10) || 1;
			brush.shadow = new fabric.Shadow({
				blur: parseInt(drawingShadowWidth.value, 10) || 0,
				offsetX: 0,
				offsetY: 0,
				affectStroke: true,
				color: drawingShadowColorEl.value,
			});
		}
	};

	drawingColorEl.onchange = function () {
		var brush = canvas.freeDrawingBrush;
		brush.color = this.value;
		if (brush.getPatternSrc) {
			brush.source = brush.getPatternSrc.call(brush);
		}
		var objs = canvas.getActiveObjects();
		objs.forEach(function (obj) {
			console.log(obj.type);
			if (obj.type === "i-text") {
				if (obj.setSelectionStyles && obj.isEditing) {
					var style = {};
					style["fill"] = drawingColorEl.value;
					obj.setSelectionStyles(style);
				} else {
					obj["fill"] = drawingColorEl.value;
				}
				canvas._historySaveAction();
				obj.enterEditing();
			} else if (obj.type === "path") {
				obj.set({ fill: drawingColorEl.value });
			}
			canvas.renderAll();
		});
	};
	drawingShadowColorEl.onchange = function () {
		canvas.freeDrawingBrush.shadow.color = this.value;
	};
	drawingLineWidthEl.onchange = function () {
		canvas.freeDrawingBrush.width = parseInt(this.value, 10) || 1;
		this.previousSibling.innerHTML = this.value;
	};
	drawingShadowWidth.onchange = function () {
		canvas.freeDrawingBrush.shadow.blur = parseInt(this.value, 10) || 0;
		this.previousSibling.innerHTML = this.value;
	};
	drawingShadowOffset.onchange = function () {
		canvas.freeDrawingBrush.shadow.offsetX = parseInt(this.value, 10) || 0;
		canvas.freeDrawingBrush.shadow.offsetY = parseInt(this.value, 10) || 0;
		this.previousSibling.innerHTML = this.value;
	};

	if (canvas.freeDrawingBrush) {
		canvas.freeDrawingBrush.color = drawingColorEl.value;
		if (canvas.freeDrawingBrush.getPatternSrc) {
			canvas.freeDrawingBrush.source = canvas.freeDrawingBrush.getPatternSrc.call(
				this
			);
		}

		canvas.freeDrawingBrush.width = parseInt(drawingLineWidthEl.value, 10) || 1;
		canvas.freeDrawingBrush.shadow = new fabric.Shadow({
			blur: parseInt(drawingShadowWidth.value, 10) || 0,
			offsetX: 0,
			offsetY: 0,
			affectStroke: true,
			color: drawingShadowColorEl.value,
		});
	}
}
