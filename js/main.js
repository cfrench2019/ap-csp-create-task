(function() {
    'use strict';

    if (Modernizr.canvas) {
        /*
         * #####################
         * # Utility Functions #
         * #####################
         */

        const getRandomNumber = function(min, max, randomFunc = Math.random) {
            return randomFunc() * (max - min) + min;
        };

        const getRandomElement = function(arr, randomFunc = Math.random) {
            return arr[Math.floor(randomFunc() * arr.length)];
        };

        const gammaRandom = function(gamma) {
            return Math.pow(Math.random(), gamma);
        };

        const getArrayDifferences = function(arr1, arr2) {
            return arr1.filter(x => !arr2.includes(x));
        };

        const mapToRange = function(value, oldMinValue, oldMaxValue, newMinValue, newMaxValue) {
            return (value - oldMinValue) * (newMaxValue - newMinValue) / (oldMaxValue - oldMinValue) + newMinValue;
        };

        const hexToRgbArray = function(hex) {
            hex = hex.replace('#', '');
            return [hex.substring(0, 2), hex.substring(2, 4), hex.substring(4, 6)].map(substr => parseInt(substr, 16));
        };

        const rgbArrayToHex = function(rgbArr) {
            return '#' + rgbArr.map(component => component.toString(16)).map(hex => hex.length === 1 ? '0' + hex : hex).join('');
        };

        const rgbArrayToRgba = function(rgbArr, a) {
            return 'rgba(' + rgbArr.concat(a) + ')';
        };

        const getFlattenedRgbArray = function(rgbArrUnderlay, rgbArrOverlay, a) {
            const flattenedRgbArray = [];
            for (let i = 0; i < 3; ++i) {
                flattenedRgbArray[i] = Math.floor(rgbArrUnderlay[i] * (1 - a) + (rgbArrOverlay[i] * a));
            }

            return flattenedRgbArray;
        };

        /*
         * ##########
         * # Canvas #
         * ##########
         */

        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;

        if (Modernizr.fullscreen && screenfull.enabled) {
            canvas.ondblclick = function() {
                screenfull.toggle(this);
            };
        }

        ctx.clear = function() {
            this.clearRect(0, 0, canvasWidth, canvasHeight);
        };

        // Movement
        const leftKeyCode = 37;
        const rightKeyCode = 39;
        let leftKeyDown = false;
        let rightKeyDown = false;
        let move = 0;
        let t = 0;
        let lowestT = t;
        let highestT = t;

        document.onkeydown = function(event) {
            switch (event.keyCode) {
                case leftKeyCode:
                    leftKeyDown = true;
                    move = 1;
                    break;
                case rightKeyCode:
                    rightKeyDown = true;
                    move = 2;
            }
        };

        document.onkeyup = function(event) {
            switch (event.keyCode) {
                case leftKeyCode:
                    leftKeyDown = false;
                    move = rightKeyDown ? 2 : 0;
                    break;
                case rightKeyCode:
                    rightKeyDown = false;
                    move = leftKeyDown ? 1 : 0;
            }
        };

        const nextT = function(onNewT) {
            if (move === 1) {
                --t;
                if (t < lowestT) {
                    lowestT = t;
                    onNewT();
                }
            } else if (move === 2) {
                ++t;
                if (t > highestT) {
                    highestT = t;
                    onNewT();
                }
            }
        };

        // Time
        const maxTime = 3600;
        let time = 0;

        const nextTime = function() {
            time = (time + 1) % (maxTime + 1) === 0 ? 0 : (time + 1);
        };

        /*
         * ###########
         * # Objects #
         * ###########
         */

        // Stars
        const stars = [];

        // Cacti
        const cacti = [];

        /*
         * ##############
         * # Dimensions #
         * ##############
         */

        // Sky
        const minNightOverlayOpacity = 0;
        const maxNightOverlayOpacity = 0.6;

        // Stars
        const starR = 1;
        const totalStars = 50;

        // Hills
        const backHillsY = canvasHeight / 3;
        const backHillsOffset = getRandomNumber(0, canvasWidth);
        const minBackHillsAmplitude = 30;
        const maxBackHillsAmplitude = 40;
        const backHillsAmplitude = getRandomNumber(minBackHillsAmplitude, maxBackHillsAmplitude);
        const minBackHillsFrequency = 1;
        const maxBackHillsFrequency = 1.5;
        const backHillsFrequency = getRandomNumber(minBackHillsFrequency, maxBackHillsFrequency);
        const frontHillsY = canvasHeight / 2;
        const frontHillsOffset = getRandomNumber(0, canvasWidth);
        const minFrontHillsAmplitude = 20;
        const maxFrontHillsAmplitude = 30;
        const frontHillsAmplitude = getRandomNumber(minFrontHillsAmplitude, maxFrontHillsAmplitude);
        const minFrontHillsFrequency = 1;
        const maxFrontHillsFrequency = 2;
        const frontHillsFrequency = getRandomNumber(minFrontHillsFrequency, maxFrontHillsFrequency);

        // Ground
        const groundLevel = canvasHeight * 2 / 3;

        // Cacti
        const minCactusY = groundLevel;
        const maxCactusY = groundLevel + 50;
        const minCactusR = 5;
        const maxCactusR = 10;
        const minCactusSegmentLength = 20;
        const maxCactusSegmentLength = 50;
        const minCactusSegments = 2;
        const maxCactusSegments = 10;
        const cactusGrowthDirections = [0, Math.PI, Math.PI * 3 / 2];
        const verticalGrowthDirectionSkew = 5;
        const totalCacti = 7;
        const minCactusSpeed = 4;
        const maxCactusSpeed = 20;

        /*
         * ##########
         * # Colors #
         * ##########
         */

        // Sky
        const skyColor = '#b9e8ff';
        const nightColor = '#151b54';

        // Stars
        const starColor = '#ffffff';

        // Hills
        const backHillsColor = '#d5c9a6';
        const frontHillsColor = '#cabd95';

        // Ground
        const sandColor = '#c2b280';

        // Cacti
        const minCactusColorComponents = [37, 114, 61];
        const maxCactusGreenComponent = 159;

        /*
         * ##############
         * # Background #
         * ##############
         */

        const getNightOverlayOpacity = function() {
            return time < maxTime / 2 ? mapToRange(time, 0, maxTime / 2, minNightOverlayOpacity, maxNightOverlayOpacity) : mapToRange(time, maxTime / 2, maxTime, maxNightOverlayOpacity, minNightOverlayOpacity);
        };

        const drawSky = function() {
            ctx.save();
            ctx.fillStyle = rgbArrayToHex(getFlattenedRgbArray(hexToRgbArray(skyColor), hexToRgbArray(nightColor), getNightOverlayOpacity()));
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
            ctx.restore();
        };

        const drawStar = function() {
            ctx.save();
            ctx.fillStyle = rgbArrayToHex(getFlattenedRgbArray(getFlattenedRgbArray(hexToRgbArray(skyColor), hexToRgbArray(nightColor), getNightOverlayOpacity()), hexToRgbArray(starColor), getNightOverlayOpacity()));
            ctx.beginPath();
            ctx.arc(this.x, this.y, starR, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        };

        const drawStars = function() {
            if (stars.length) {
                stars.forEach(star => star.draw());
            } else {
                for (let i = 0; i < totalStars; ++i) {
                    stars.push({
                        x: Math.random() * canvasWidth,
                        y: Math.random() * groundLevel,
                        draw: drawStar
                    });
                }
            }
        };

        const drawHills = function(y, offset, amplitude, frequency, color, t) {
            ctx.save();
            ctx.fillStyle = rgbArrayToHex(getFlattenedRgbArray(hexToRgbArray(color), hexToRgbArray(nightColor), getNightOverlayOpacity()));

            ctx.beginPath();
            ctx.moveTo(0, y);

            for (let x = 0; x <= canvasWidth; ++x) {
                ctx.lineTo(x, y - Math.sin(frequency * x * Math.PI / 180 + offset + (t * frequency)) * amplitude);
            }

            ctx.lineTo(canvasWidth, canvasHeight);
            ctx.lineTo(0, canvasHeight);
            ctx.fill();

            ctx.restore();
        };

        const drawBackground = function() {
            drawSky();
            drawStars();
            drawHills(backHillsY, backHillsOffset, backHillsAmplitude, backHillsFrequency, backHillsColor, t / 50);
            drawHills(frontHillsY, frontHillsOffset, frontHillsAmplitude, frontHillsFrequency, frontHillsColor, t / 25);
        };

        /*
         * ##############
         * # Foreground #
         * ##############
         */

        const drawGround = function() {
            ctx.save();
            ctx.fillStyle = rgbArrayToHex(getFlattenedRgbArray(hexToRgbArray(sandColor), hexToRgbArray(nightColor), getNightOverlayOpacity()));
            ctx.fillRect(0, groundLevel, canvasWidth, canvasHeight);
            ctx.restore();
        };

        const drawCactusSegment = function(x1, y1, x2, y2) {
            ctx.save();
            ctx.lineWidth = this.r * 2;
            ctx.strokeStyle = ctx.fillStyle = rgbArrayToHex(getFlattenedRgbArray(hexToRgbArray(this.color), hexToRgbArray(nightColor), getNightOverlayOpacity()));

            ctx.beginPath();
            ctx.arc(x1, y1, this.r, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(x2, y2, this.r, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        };

        const drawCactus = function() {
            const modifiedT = t * mapToRange(this.y, minCactusY, maxCactusY, minCactusSpeed, maxCactusSpeed);
            this.drawSegment(this.x - modifiedT, this.y, this.nodes[0].x - modifiedT, this.nodes[0].y);

            for (let i = 0; i < this.nodes.length; ++i) {
                for (let j = 0; j < this.nodes[i].segments.length; ++j) {
                    this.drawSegment(this.nodes[i].x - modifiedT, this.nodes[i].y, this.nodes[i].segments[j].terminalX - modifiedT, this.nodes[i].segments[j].terminalY);
                }
            }
        };

        const generateCacti = function() {
            if (move === 1 && t % Math.floor(canvasWidth / maxCactusSpeed) === 0) {
                for (let i = 0; i < totalCacti; ++i) {
                    createCactus(() => getRandomNumber(t * maxCactusSpeed, t * maxCactusSpeed - canvasWidth));
                }
            } else if (move === 2 && t % Math.floor(canvasWidth / maxCactusSpeed) === 0) {
                for (let i = 0; i < totalCacti; ++i) {
                    createCactus(() => getRandomNumber(t * maxCactusSpeed + canvasWidth, t * maxCactusSpeed + (canvasWidth * 2)));
                }
            }
        };

        const createCactus = function(xFunc) {
            const x = xFunc();
            const y = getRandomNumber(minCactusY, maxCactusY);
            const cactus = {
                x: x,
                y: y,
                r: getRandomNumber(minCactusR, maxCactusR),
                // The color is darker the higher the cactus' z-coordinate is
                color: rgbArrayToHex([minCactusColorComponents[0], Math.floor(mapToRange(y, minCactusY, maxCactusY, maxCactusGreenComponent, minCactusColorComponents[1])), minCactusColorComponents[2]]),
                nodes: [{
                    x: x,
                    y: y - getRandomNumber(minCactusSegmentLength, maxCactusSegmentLength),
                    segments: [],
                    directions: []
                }],
                drawSegment: drawCactusSegment,
                draw: drawCactus
            };

            for (let j = 0; j < getRandomNumber(minCactusSegments, maxCactusSegments); ++j) {
                let node;
                let growthDirectionDifferences;

                while ((node = getRandomElement(cactus.nodes))) {
                    if ((growthDirectionDifferences = getArrayDifferences(cactusGrowthDirections, node.directions)).length) {
                        break;
                    }
                }

                // Grow cactus left, right, or upward randomly with a bias upward
                let growthDirection;
                if (growthDirectionDifferences.length === 1) {
                    growthDirection = growthDirectionDifferences[0];
                } else if (growthDirectionDifferences.indexOf(cactusGrowthDirections[2]) === -1) {
                    growthDirection = getRandomElement(growthDirectionDifferences);
                } else {
                    growthDirectionDifferences.sort((growthDirection1, growthDirection2) => growthDirection1 - growthDirection2);
                    let tentativeGrowthDirection = getRandomElement(growthDirectionDifferences, () => gammaRandom(1 / verticalGrowthDirectionSkew));

                    if (tentativeGrowthDirection === cactusGrowthDirections[2]) {
                        growthDirection = tentativeGrowthDirection;
                    } else {
                        growthDirection = getRandomElement(growthDirectionDifferences.slice(0, -1));
                    }
                }

                const terminalX = node.x + (Math.cos(growthDirection) * getRandomNumber(minCactusSegmentLength, maxCactusSegmentLength));
                const terminalY = node.y + (Math.sin(growthDirection) * getRandomNumber(minCactusSegmentLength, maxCactusSegmentLength));
                node.directions.push(growthDirection);
                node.segments.push({
                    terminalX: terminalX,
                    terminalY: terminalY
                });

                cactus.nodes.push({
                    x: terminalX,
                    y: terminalY,
                    segments: [],
                    directions: []
                });
            }

            // Ensure that all nodes yield an upward segment
            cactus.nodes.forEach(node => {
                if (!node.directions.includes(cactusGrowthDirections[2])) {
                    node.segments.push({
                        terminalX: node.x,
                        terminalY: node.y - getRandomNumber(minCactusSegmentLength, maxCactusSegmentLength)
                    });
                }
            });

            cacti.push(cactus);
            cacti.sort((cactus1, cactus2) => cactus1.y - cactus2.y);
        };

        const drawCacti = function() {
            if (cacti.length) {
                cacti.forEach(cactus => cactus.draw());
            } else {
                for (let i = 0; i < totalCacti; ++i) {
                    createCactus(() => getRandomNumber(-canvasWidth, 0));
                    createCactus(() => Math.random() * canvasWidth);
                    createCactus(() => getRandomNumber(canvasWidth, canvasWidth * 2));
                }
            }
        };

        const drawForeground = function() {
            drawGround();
            drawCacti();
        };

        const draw = function() {
            ctx.clear();
            ctx.save();
            drawBackground();
            drawForeground();
            ctx.restore();
            nextT(generateCacti);
            nextTime();
            requestAnimationFrame(draw);
        };

        requestAnimationFrame(draw);
    }
})();
