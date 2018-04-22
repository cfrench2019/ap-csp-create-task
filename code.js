(function() {
    'use strict';

    // Canvas
    var canvasWidth = 320;
    var canvasHeight = 450;
    var fps = 30;

    // Scene
    var day = true;

    // Daytime
    var sunX = 190;
    var sunY = 60;
    var sunR = 50;
    var sunColor = '#f9d71c';
    var skyBlue = '#87ceeb';

    // Nighttime
    var moonX = sunX;
    var moonY = sunY;
    var moonR = sunR;
    var moonColor = '#e5e5e5';
    var nightBlue = '#191970';
    var nightOverlayColor = 'rgba(25, 25, 112, 0.1)';

    // Stars
    var starR = moonR / 20;
    var starColor = '#ffffff';
    var totalStars = 20;
    var stars = [];

    // Buildings
    var buildingGroundLevel = 350;
    var innerBuildingPadding = 10;
    var windowPadding = 10;
    var buildingOutlineColor = '#414141';
    var buildingWallColor = '#464646';
    var windowOutlineColor = '#9e9e9e';
    var unlitWindowColor = '#6d6d6d';
    var litWindowColor = '#ffe14e';

    // Sidewalks
    var backSidewalkGroundLevel = 360;
    var backSidewalkHeight = (backSidewalkGroundLevel - buildingGroundLevel) * 2;
    var frontSidewalkGroundLevel = 435;
    var frontSidewalkHeight = (canvasHeight - frontSidewalkGroundLevel) * 2;
    var sidewalkColor = '#b7ada3';
    var sidewalkBoundaryColor = '#2b2b2b';

    // Road
    var roadHeight = frontSidewalkGroundLevel - (frontSidewalkHeight / 2) - (backSidewalkGroundLevel + (backSidewalkHeight / 2));
    var roadGroundLevel = backSidewalkGroundLevel + ((backSidewalkHeight + roadHeight) / 2);
    var roadColor = '#2b2b2b';
    var roadDashWidth = 20;
    var roadDashHeight = 2;
    var roadDashColor = '#fff700';

    // People
    var backPeople = [];
    var frontPeople = [];
    var skinColors = [
        '#8d5524',
        '#c68642',
        '#e0ac69',
        '#f1c27d',
        '#ffdbac'
    ];
    var shirtColors = [
        '#ffffff',
        '#de0000',
        '#127800',
        '#000aa4',
        '#cd30c1',
        '#f4ff71'
    ];
    var pantColors = [
        '#000000',
        '#3f2700',
        '#002101',
        '#000833',
        '#3a3a3a'
    ];

    createCanvas('canvas', canvasWidth, canvasHeight);
    setInterval(function() {
        clearCanvas();
        draw();
    }, 1000 / fps);

    setInterval(function() {
        backPeople.push(drawPerson(backSidewalkGroundLevel, 0.75));
        frontPeople.push(drawPerson(frontSidewalkGroundLevel, 1));
    }, 1000);

    onEvent('canvas', 'click', function(event) {
        if (day) {
            if (Math.pow(sunX - event.x, 2) + Math.pow(sunY - event.y, 2) < Math.pow(sunR, 2)) {
                day = false;
            }
        } else if (Math.pow(moonX - event.x, 2) + Math.pow(moonY - event.y, 2) < Math.pow(moonR, 2)) {
            day = true;
        }
    });

    function draw() {
        drawSky();
        drawCity();
        drawPeople();
        if (!day) {
            setStrokeWidth(1);
            setStrokeColor(nightOverlayColor);
            setFillColor(nightOverlayColor);
            rect(0, 0, canvasWidth, canvasHeight);
        }
    }

    function drawSky() {
        if (day) {
            drawDay();
        } else {
            drawNight();
        }
    }

    function drawDay() {
        stars = [];
        setStrokeWidth(1);
        setStrokeColor(skyBlue);
        setFillColor(skyBlue);
        rect(0, 0, canvasWidth, canvasHeight);
        drawSun();
    }

    function drawSun() {
        setStrokeWidth(1);
        setStrokeColor(sunColor);
        setFillColor(sunColor);
        circle(sunX, sunY, sunR);
    }

    function drawNight() {
        setStrokeWidth(1);
        setStrokeColor(nightBlue);
        setFillColor(nightBlue);
        rect(0, 0, canvasWidth, canvasHeight);
        drawStars();
        drawMoon();
    }

    function drawMoon() {
        setStrokeWidth(1);
        setStrokeColor(moonColor);
        setFillColor(moonColor);
        circle(moonX, moonY, moonR);
    }

    function drawStars() {
        if (stars.length) {
            stars.forEach(function(star) {
                star.draw(star.x, star.y);
            });
        } else {
            for (var i = 0; i < totalStars; ++i) {
                stars.push({
                    x: randomNumber(0, canvasWidth),
                    y: randomNumber(0, canvasHeight),
                    draw: drawStar
                });
            }
        }
    }

    function drawStar(x, y) {
        setStrokeWidth(1);
        setStrokeColor(starColor);
        setFillColor(starColor);
        circle(x, y, starR);
    }

    function drawCity() {
        drawBuildings();
        drawStreet();
    }

    function drawStreet() {
        drawBackSidewalk();
        drawRoad();
        drawFrontSidewalk();
    }

    function drawBackSidewalk() {
        setStrokeWidth(1);
        setStrokeColor(sidewalkBoundaryColor);
        setFillColor(sidewalkColor);
        rect(0, backSidewalkGroundLevel - (backSidewalkHeight / 2), canvasWidth, backSidewalkHeight);

        for (var x = 10; x < canvasWidth; x += backSidewalkHeight) {
            line(x, backSidewalkGroundLevel - (backSidewalkHeight / 2), x, backSidewalkGroundLevel + (backSidewalkHeight / 2));
        }
    }

    function drawRoad() {
        setStrokeWidth(1);
        setStrokeColor(roadColor);
        setFillColor(roadColor);
        rect(0, roadGroundLevel - (roadHeight / 2), canvasWidth, roadHeight);
        setStrokeColor(roadDashColor);
        setFillColor(roadDashColor);

        for (var x = 10; x < canvasWidth; x += roadDashWidth * 2) {
            rect(x, roadGroundLevel - roadDashHeight - 3, roadDashWidth, roadDashHeight);
        }
    }

    function drawFrontSidewalk() {
        setStrokeWidth(1);
        setStrokeColor(sidewalkBoundaryColor);
        setFillColor(sidewalkColor);
        rect(0, frontSidewalkGroundLevel - (frontSidewalkHeight / 2), canvasWidth, frontSidewalkHeight);

        for (var x = 10; x < canvasWidth; x += frontSidewalkHeight) {
            line(x, frontSidewalkGroundLevel - (frontSidewalkHeight / 2), x, frontSidewalkGroundLevel + (frontSidewalkHeight / 2));
        }
    }

    function drawBuildings() {
        drawBuilding(10, 150, 300);
        drawBuilding(200, 110, 250);
        drawBuilding(100, 120, 200);
    }

    function drawBuilding(x, width, height) {
        var y = buildingGroundLevel - height;
        setStrokeWidth(2);
        setStrokeColor(buildingOutlineColor);
        setFillColor(buildingWallColor);
        rect(x, y, width, height);
        drawWindows(x, y, width, height);
    }

    function drawWindows(x, y, width, height) {
        var paddedBuildingWidth = width - (innerBuildingPadding * 2);
        var paddedBuildingHeight = height - (innerBuildingPadding * 2);
        var windowWidth = width / 10;
        var windowHeight = height / 10;
        var paddedWindowWidth = windowWidth + (windowPadding * 2);
        var paddedWindowHeight = windowHeight + (windowPadding * 2);
        var windowsPerRow = Math.floor((paddedBuildingWidth + (windowPadding * 2)) / paddedWindowWidth);
        var windowsPerColumn = Math.floor((paddedBuildingHeight + (windowPadding * 2)) / paddedWindowHeight);
        var firstWindowX = x + windowPadding + (width / 2) - (paddedWindowWidth * windowsPerRow) / 2;
        var firstWindowY = y + windowPadding + (height / 2) - (paddedWindowHeight * windowsPerColumn) / 2;

        for (var i = 0; i < windowsPerColumn; ++i) {
            for (var j = 0; j < windowsPerRow; ++j) {
                drawWindow(firstWindowX + (paddedWindowWidth * j), firstWindowY + (paddedWindowHeight * i), windowWidth, windowHeight);
            }
        }
    }

    function drawWindow(x, y, width, height) {
        setStrokeWidth(1);
        setStrokeColor(windowOutlineColor);
        setFillColor(day ? unlitWindowColor : litWindowColor);
        rect(x, y, width, height);
        line(x + (width / 2), y, x + (width / 2), y + height);
        line(x, y + (height / 2), x + width, y + (height / 2));
    }

    function drawPeople() {
        [backPeople, frontPeople].forEach(function(people) {
            for (var i = 0; i < people.length; ++i) {
                var person = people[i];
                person.drawNextFrame();
                if (person.isOffScreen()) {
                    people.splice(i--, 1);
                }
            }
        });
    }

    function drawPerson(y, scale) {
        var x = NaN;
        var r = randomNumber(20, 25) * scale;
        var skinColor = randomElement(skinColors);
        var shirtColor = randomElement(shirtColors);
        var pantColor = randomElement(pantColors);
        var tDelta = randomNumber(5, 10) / 100;
        var tDirection = (2 * randomNumber(0, 1)) - 1; // -1 or 1
        var tMin = Math.PI / 3;
        var tMax = Math.PI - tMin;
        var t = NaN;

        if (tDirection === -1) {
            x = canvasWidth;
            t = tMax;
        } else if (tDirection === 1) {
            x = 0;
            t = tMin;
        }

        var person = {
            x: x,
            y: y,
            r: r,
            skinColor: skinColor,
            shirtColor: shirtColor,
            pantColor: pantColor,
            tDelta: tDelta,
            tDirection: tDirection,
            tMin: tMin,
            tMax: tMax,
            t: t,
            drawNextFrame: function() {
                this.drawNeck();
                this.drawHead();
                this.drawEye();
                this.drawTorso();
                this.drawLeftArm();
                this.drawRightArm();
                this.drawLeftLeg();
                this.drawRightLeg();
                this.x += this.tDelta * this.r * tDirection;
                this.nextT();
            },
            drawNeck: function() {
                var y = this.y - (this.r * 2);
                setStrokeWidth(this.r / 15);
                setStrokeColor(this.skinColor);
                line(this.x, y, this.x, y - (this.r / 8));
            },
            drawHead: function() {
                var y = this.y - (this.r * 17 / 8);
                var r = this.r / 5;
                setStrokeWidth(this.r / 15);
                setStrokeColor(this.skinColor);
                setFillColor(this.skinColor);
                circle(this.x, y - r, r);
            },
            drawEye: function() {
                var x = this.x + (tDirection * this.r / 10);
                var y = this.y - (this.r * 19 / 8);
                var r = this.r / 100;
                setStrokeWidth(this.r / 15);
                setStrokeColor('#000000');
                setFillColor('#000000');
                circle(x, y, r);
            },
            drawTorso: function() {
                var y = this.y - this.r;
                setStrokeWidth(this.r / 5);
                setStrokeColor(this.shirtColor);
                line(this.x, y, this.x, y - this.r);
            },
            drawLeftArm: function() {
                this.drawArm(false);
            },
            drawRightArm: function() {
                this.drawArm(true);
            },
            drawArm: function(reversed) {
                var y = this.y - (this.r * 2);
                var sleeveLength = this.r * 1 / 3;
                var skinLength = this.r - sleeveLength;
                var t = reversed ? Math.PI - this.t : this.t;
                setStrokeWidth(this.r / 15);
                setStrokeColor(this.skinColor);
                line(this.x, y, this.x + (Math.cos(t) * skinLength), y + (Math.abs(Math.sin(t)) * skinLength));
                setStrokeWidth(this.r / 10);
                setStrokeColor(this.shirtColor);
                line(this.x, y, this.x + (Math.cos(t) * sleeveLength), y + (Math.abs(Math.sin(t)) * sleeveLength));
            },
            drawLeftLeg: function() {
                this.drawLeg(true);
            },
            drawRightLeg: function() {
                this.drawLeg(false);
            },
            drawLeg: function(reversed) {
                var y = this.y - this.r;
                var t = reversed ? Math.PI - this.t : this.t;
                setStrokeWidth(this.r / 10);
                setStrokeColor(this.pantColor);
                line(this.x, y, this.x + (Math.cos(t) * this.r), y + (Math.abs(Math.sin(t)) * this.r));
            },
            nextT: function() {
                var next = this.t + (this.tDelta * this.tDirection);
                if (this.tDirection === -1) {
                    if (next < this.tMin) {
                        this.t = this.tMin;
                        this.tDirection = 1;
                    }
                } else if (this.tDirection === 1) {
                    if (next > this.tMax) {
                        this.t = this.tMax;
                        this.tDirection = -1;
                    }
                } else {
                    return;
                }

                this.t = next;
            },
            isOffScreen: function() {
                var halfWidth = Math.cos(this.tMin) * this.r;
                return this.x + halfWidth < 0 || this.x - halfWidth > canvasWidth;
            }
        };

        return person;
    }

    function randomElement(array) {
        return array[randomNumber(0, array.length - 1)];
    }
})();
