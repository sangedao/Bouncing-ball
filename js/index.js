"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Game = function () {
    function Game() {
        _classCallCheck(this, Game);

        this.score = 0;
        this.isRunning = 0; // 0 游戏没有运行

        this.calculateScale();

        this.timeline = new TimelineMax({ smoothChildTiming: true });
        this.time = 1.6; // 初始速度
        this.colors = ["#FF4571", "#FFD145", "#8260F6"]; // 游戏中使用的3种颜色
        this.colorsRGBA = ["rgba(255, 69, 113, 1)", "rgba(255, 69, 113, 1)", "rgba(255, 69, 113, 1)"];
        this.color = this.colors[0]; // 球的最初颜色
        this.prevColor = null; // 用作保持架以防止球的颜色重复
    }

    /**
    *游戏屏幕是可伸缩的。我以1200x800px为初始比例尺。
    *为了正确地显示游戏的许多屏幕尺寸
    *我得把玩家的大小和初始的音阶比较一下，
    *然后使用CSS转换缩放游戏，使其适合屏幕
    *该函数在控制器中调用，并在我需要的任何地方调用
    *重新计算屏幕缩放或设备旋转
     */

    Game.prototype.calculateScale = function calculateScale() {
        this.screen = $(window).width(); // screen width
        this.screenHeight = $(window).height();
        this.scale = this.screen > this.screenHeight ? this.screenHeight / 800 : this.screen / 1200;
        this.stickWidth = 180 * this.scale;
        this.steps = this.screen / this.stickWidth; // how many steps (stick width + margin) it takes from one end to another
    };

    /**
     * Creating as many sticks we need to fill the screen
     * from start to end of the screen. The steps property is used for that
     */

    Game.prototype.generateSticks = function generateSticks() {
        var numberOfSticks = Math.ceil(this.steps);
        for (var i = 0; i <= numberOfSticks; i++) {
            new Stick();
        }
    };

    Game.prototype.generateBall = function generateBall() {
        this.balltween = new TimelineMax({ repeat: -1, paused: 1 });
        $('.scene .ball-holder').append('<div class="ball red" id="ball"></div>');
        this.bounce();
    };

    Game.prototype.generateTweet = function generateTweet() {
        var top = $(window).height() / 2 - 150;
        var left = $(window).width() / 2 - 300;
        window.open("# " + this.score + " points on Coloron! Can you beat my score?&via=greghvns&hashtags=coloron", "TweetWindow", "width=600px,height=300px,top=" + top + ",left=" + left);
    };

    /**
     * 游戏开始
     */

    Game.prototype.intro = function intro() {
        var _this = this;

        TweenMax.killAll();

        //TweenMax.to('.splash', 0.3, { opacity: 0, display: 'none', delay: 1 })

        $('.stop-game').css('display', 'none');
        $('.start-game').css('display', 'flex');

        var introTl = new TimelineMax();
        var ball = new TimelineMax({ repeat: -1, delay: 3 });
        introTl.fromTo('.start-game .logo-holder', 0.9, { opacity: 0 }, { opacity: 1 }).staggerFromTo('.start-game .logo span', 0.5, { opacity: 0 }, { opacity: 1 }, 0.08).staggerFromTo('.start-game .bar', 1.6, { y: '+100%' }, { y: '0%', ease: Elastic.easeOut.config(1, 0.3) }, 0.08).staggerFromTo('.start-game .ball-demo', 1, { scale: 0 }, { scale: 1, ease: Elastic.easeOut.config(1, 0.3) }, 0.8, 2);

        ball.fromTo('.start-game .section-1 .ball-demo', 0.5, { y: "0px" }, { y: "100px", scaleY: 1.1, transformOrigin: "bottom", ease: Power2.easeIn }).to('.start-game .section-1 .ball-demo', 0.5, { y: "0px", scaleY: 1, transformOrigin: "bottom", ease: Power2.easeOut,
            onStart: function onStart() {
                while (_this.prevColor == _this.color) {
                    _this.color = new Color().getRandomColor();
                }
                _this.prevColor = _this.color;
                TweenMax.to('.start-game .section-1 .ball-demo', 0.5, { backgroundColor: _this.color });
            }
        });
    };

    /**
    *显示分数
     */

    Game.prototype.showResult = function showResult() {
        var score = this.score;
        $('.stop-game').css('display', 'flex');
        $('.stop-game .final-score').text(score + '!');
        $('.stop-game .result').text(this.showGrade(score));
        $('.nominee').show();

        var resultTimeline = new TimelineMax();
        resultTimeline.fromTo('.stop-game .score-container', 0.7, { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, ease: Elastic.easeOut.config(1.25, 0.5) }).fromTo('.stop-game .final-score', 2, { scale: 0.5 }, { scale: 1, ease: Elastic.easeOut.config(2, 0.5) }, 0).fromTo('.stop-game .result', 1, { scale: 0.5 }, { scale: 1, ease: Elastic.easeOut.config(1.5, 0.5) }, 0.3);
    };

    /**
     * 获取分数
     * @param  {int} score
     * @return {string} grade
     */

    Game.prototype.showGrade = function showGrade(score) {
        if (score > 30) return "Chuck Norris?";else if (score > 25) return "You're da man";else if (score > 20) return "Awesome";else if (score > 15) return "Great!";else if (score > 13) return "Nice!";else if (score > 10) return "Good Job!";else if (score > 5) return "Really?";else return "Poor...";
    };

    Game.prototype.start = function start() {

        this.stop(); // 停止游戏

        $('.start-game, .stop-game').css('display', 'none'); // 隐藏所有弹出窗口
        $('.nominee').hide();

        new Game();
        this.score = 0; // 重置分数

        this.isRunning = 1;

        // 清理球杆和球杆座并制造新的球杆和球杆座
        $('#sticks, .scene .ball-holder').html('');
        $('#score').text(this.score);
        this.generateSticks();
        this.generateBall();

        // 禁用手机的场景动画
        if (!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(window.navigator.userAgent)) {
            Animation.sceneAnimation();
        }
        this.moveToStart();
        this.moveScene();

        // 随着游戏速度的加快，将时间刻度重置为正常
        this.timeline.timeScale(1);
        this.balltween.timeScale(1);
    };

    Game.prototype.stop = function stop() {

        this.isRunning = 0;

        $('.start-game, .stop-game').css('display', 'none');
        $('#sticks, .scene .ball-holder, #score').html('');
        TweenMax.killAll();

        this.showResult();
    };

    Game.prototype.scaleScreen = function scaleScreen() {

        TweenMax.killAll(); // 防止在调整大小时多次调用

        var height = $(window).height();
        var width = $(window).width();

        this.calculateScale();

        $('.container').css('transform', 'scale(' + this.scale + ')').css('height', height / this.scale).css('width', width / this.scale).css('transformOrigin', 'left top');

        $('#sticks').width(this.screen / this.scale + 3 * this.stickWidth / this.scale);
    };

/**
*调用上述函数
*如果游戏正在运行，它会停止并显示得分
*如果游戏已停止，则需要玩家进入主菜单
*/

    Game.prototype.scaleScreenAndRun = function scaleScreenAndRun() {

        this.scaleScreen();

        if (this.isRunning) {
            this.stop();
        } else {
            this.intro();
        }
    };

/**
*初始动画
*当木棒到达起始位置时
*球出现并落下
*/

    Game.prototype.moveToStart = function moveToStart() {
        var _this2 = this;

        var tip = new TimelineMax({ delay: 2 });

        tip.fromTo('.learn-to-play', 1, { scale: 0 }, { scale: 1, opacity: 1, ease: Elastic.easeOut.config(1.25, 0.5) }).to('.learn-to-play', 1, { scale: 0, opacity: 0, ease: Elastic.easeOut.config(1.25, 0.5) }, 3);

        TweenMax.fromTo('#ball', this.time, {
            scale: 0
        }, {
            scale: 1,
            delay: this.time * (this.steps - 3 - 1.5),
            onComplete: function onComplete() {
                _this2.balltween.play();
            }
        });

        this.timeline.add(TweenMax.fromTo('#sticks', this.time * this.steps, { x: this.screen / this.scale }, { x: 0, ease: Power0.easeNone }));
    };

    /**
     * 移动木棒的动画
     */

    Game.prototype.moveScene = function moveScene() {
        var _this3 = this;

        this.timeline.add(TweenMax.to('#sticks', this.time, { x: '-=180px', ease: Power0.easeNone, repeat: -1, onRepeat: function onRepeat() {
                _this3.rearrange();
            } }));
    };

    /**
        *去掉第一根棍子，在末端加上一根
        *这给棍子一个无限的运动
     */

    Game.prototype.rearrange = function rearrange() {

        var scale = this.speedUp();

        this.timeline.timeScale(scale);
        this.balltween.timeScale(scale);

        $('#sticks .stick').first().remove();
        new Stick();
    };

    /**
    *比赛根据比分加速
    *在时间线上调用GSAP timeScale（）函数以加快游戏速度
    *这计算出游戏的速度应该加快多少
    */

    Game.prototype.speedUp = function speedUp() {
        if (this.score > 30) {
            return 1.8;
        }
        if (this.score > 20) {
            return 1.7;
        }
        if (this.score > 15) {
            return 1.5;
        } else if (this.score > 12) {
            return 1.4;
        } else if (this.score > 10) {
            return 1.3;
        } else if (this.score > 8) {
            return 1.2;
        } else if (this.score > 5) {
            return 1.1;
        }
        return 1;
    };

    /**
    *球反弹动画
    *它检查球和棍子的颜色是否匹配
    *改变球的颜色
    */

    Game.prototype.bounce = function bounce() {
        var _this4 = this;

        this.balltween.to('#ball', this.time / 2, { y: '+=250px', scaleY: 0.7, transformOrigin: "bottom", ease: Power2.easeIn,
            onComplete: function onComplete() {
                _this4.checkColor();
            }
        }).to('#ball', this.time / 2, { y: '-=250px', scaleY: 1.1, transformOrigin: "bottom", ease: Power2.easeOut,
            onStart: function onStart() {
                while (_this4.prevColor == _this4.color) {
                    _this4.color = new Color().getRandomColor();
                }
                _this4.prevColor = _this4.color;
                TweenMax.to('#ball', 0.5, { backgroundColor: _this4.color });
                $('#ball').removeClass('red').removeClass('yellow').removeClass('purple').addClass(new Color().colorcodeToName(_this4.color));
            }
        });
    };

    Game.prototype.checkColor = function checkColor() {

        var ballPos = $('#ball').offset().left + $('#ball').width() / 2;
        var stickWidth = $('.stick').width();
        var score = this.score;

        $('#sticks .stick').each(function () {
            if ($(this).offset().left < ballPos && $(this).offset().left > ballPos - stickWidth) {

                if (Color.getColorFromClass($(this)) == Color.getColorFromClass('#ball')) {
                    //如果比赛增加比分
                    score++;
                    $('#score').text(score);
                    TweenMax.fromTo('#score', 0.5, { scale: 1.5 }, { scale: 1, ease: Elastic.easeOut.config(1.5, 0.5) });
                } else {

                    //松开
                    game.stop();
                }
            }
        });

        this.score = score;
    };

    return Game;
}();

var Stick = function () {
    function Stick() {
        _classCallCheck(this, Stick);

        this.stick = this.addStick();
    }

    Stick.prototype.addStick = function addStick() {
        this.stick = $('#sticks').append('<div class="stick inactive"></div>');
        return this.stick;
    };

    return Stick;
}();

var Color = function () {
    function Color() {
        _classCallCheck(this, Color);

        this.colors = ["#FF4571", "#FFD145", "#8260F6"];
        this.effects = ["bubble", "triangle", "block"];
        this.prevEffect = null;
    }

    Color.prototype.getRandomColor = function getRandomColor() {
        var colorIndex = Math.random() * 3;
        var color = this.colors[Math.floor(colorIndex)];
        return color;
    };

    Color.prototype.colorcodeToName = function colorcodeToName(color) {
        var colors = ["#FF4571", "#FFD145", "#8260F6"];
        var names = ["red", "yellow", "purple"];
        var index = colors.indexOf(color);
        if (index == -1) return false;
        return names[index];
    };

    /**
    *更改元素的颜色
    */

    Color.prototype.changeColor = function changeColor(el) {
        var index = el.data("index");
        if (index === undefined) {
            index = 0;
        } else {
            index += 1;
        }
        if (index == 3) index = 0;
        el.css('background-color', this.colors[index]).data('index', index);

        el.removeClass('red').removeClass('yellow').removeClass('purple').addClass(this.colorcodeToName(this.colors[index]));

        if (el.hasClass('inactive')) {
            this.setEffect(el);
            el.addClass('no-effect');
        }

        el.removeClass('inactive');
    };

    Color.prototype.getRandomEffect = function getRandomEffect() {
        var effectIndex = null;

        effectIndex = Math.floor(Math.random() * 3);
        while (effectIndex == this.prevEffect) {
            effectIndex = Math.floor(Math.random() * 3);
        }

        this.prevEffect = effectIndex;
        return this.effects[effectIndex];
    };

    /**
    *将效果特定的粒子添加到棍子中
    */

    Color.prototype.setEffect = function setEffect(el) {
        var effect = this.getRandomEffect();
        el.addClass(effect + '-stick');
        for (var i = 1; i <= 14; i++) {
            if (effect == 'block') {
                el.append("<div class=\"" + effect + " " + effect + "-" + i + "\"><div class=\"inner\"></div><div class=\"inner inner-2\"></div></div>");
            } else {
                el.append("<div class=\"" + effect + " " + effect + "-" + i + "\"></div>");
            }
        }
    };

    /**
     * 因为球和棍子有好几节
     * 此方法搜索颜色类
     * @param el [DOM element]
     * @return {string} class name
     */

    Color.getColorFromClass = function getColorFromClass(el) {
        var classes = $(el).attr('class').split(/\s+/);
        for (var i = 0, len = classes.length; i < len; i++) {
            if (classes[i] == 'red' || classes[i] == 'yellow' || classes[i] == 'purple') {
                return classes[i];
            }
        }
    };

    return Color;
}();

var Animation = function () {
    function Animation() {
        _classCallCheck(this, Animation);
    }

    /**
     * 在屏幕上创建和定位小发光元素
     */

    Animation.generateSmallGlows = function generateSmallGlows(number) {
        var h = $(window).height();
        var w = $(window).width();
        var scale = w > h ? h / 800 : w / 1200;

        h = h / scale;
        w = w / scale;

        for (var i = 0; i < number; i++) {
            var left = Math.floor(Math.random() * w);
            var top = Math.floor(Math.random() * (h / 2));
            var size = Math.floor(Math.random() * 8) + 4;
            $('.small-glows').prepend('<div class="small-glow"></div>');
            var noise = $('.small-glows .small-glow').first();
            noise.css({ left: left, top: top, height: size, width: size });
        }
    };

    /**
    *为棍子创建动画
    *效果是随机选择的
    *三个功能之一是
    *相应地调用
     */

    Animation.prototype.playBubble = function playBubble(el) {
        var bubble = new TimelineMax();
        bubble.staggerFromTo(el.find('.bubble'), 0.3, { scale: 0.1 }, { scale: 1 }, 0.03);
        bubble.staggerTo(el.find('.bubble'), 0.5, { y: '-=60px', yoyo: true, repeat: -1 }, 0.03);
    };

    Animation.prototype.playTriangle = function playTriangle(el) {
        var triangle = new TimelineMax();
        triangle.staggerFromTo(el.find('.triangle'), 0.3, { scale: 0.1 }, { scale: 1 }, 0.03).staggerTo(el.find('.triangle'), 1.5, {
            cycle: {
                rotationY: [0, 360],
                rotationX: [360, 0]
            },
            repeat: -1,
            repeatDelay: 0.1
        }, 0.1);
    };

    Animation.prototype.playBlock = function playBlock(el) {
        var block = new TimelineMax();
        var block2 = new TimelineMax({ delay: 0.69 });

        block.staggerFromTo(el.find('.block'), 0.3, { scale: 0.1 }, { scale: 1 }, 0.03).staggerTo(el.find('.block .inner:not(.inner-2)'), 1, {
            cycle: {
                x: ["+200%", "-200%"]
            },
            repeat: -1,
            repeatDelay: 0.6
        }, 0.1);
        block2.staggerTo(el.find('.block .inner-2'), 1, {
            cycle: {
                x: ["+200%", "-200%"]
            },
            repeat: -1,
            repeatDelay: 0.6
        }, 0.1);
    };

    Animation.sceneAnimation = function sceneAnimation() {

        var speed = 15; // 用当地的速度

        // 以圆周运动设置小辉光的动画
        $('.small-glow').each(function () {
            var speedDelta = Math.floor(Math.random() * 8);
            var radius = Math.floor(Math.random() * 20) + 20;
            TweenMax.to($(this), speed + speedDelta, { rotation: 360, transformOrigin: "-" + radius + "px -" + radius + "px", repeat: -1, ease: Power0.easeNone });
        });

        var wavet = TweenMax.to('.top_wave', speed * 1.7 / 42, { backgroundPositionX: '-=54px', repeat: -1, ease: Power0.easeNone });
        var wave1 = TweenMax.to('.wave1', speed * 1.9 / 42, { backgroundPositionX: '-=54px', repeat: -1, ease: Power0.easeNone });
        var wave2 = TweenMax.to('.wave2', speed * 2 / 42, { backgroundPositionX: '-=54px', repeat: -1, ease: Power0.easeNone });
        var wave3 = TweenMax.to('.wave3', speed * 2.2 / 42, { backgroundPositionX: '-=54px', repeat: -1, ease: Power0.easeNone });
        var wave4 = TweenMax.to('.wave4', speed * 2.4 / 42, { backgroundPositionX: '-=54px', repeat: -1, ease: Power0.easeNone });

        var mount1 = TweenMax.to('.mount1', speed * 8, { backgroundPositionX: '-=1760px', repeat: -1, ease: Power0.easeNone });
        var mount2 = TweenMax.to('.mount2', speed * 10, { backgroundPositionX: '-=1782px', repeat: -1, ease: Power0.easeNone });

        var clouds = TweenMax.to('.clouds', speed * 3, { backgroundPositionX: '-=1001px', repeat: -1, ease: Power0.easeNone });
    };

    return Animation;
}();

var game = new Game();
var animation = new Animation();
var color = new Color();
var userAgent = window.navigator.userAgent;

Animation.generateSmallGlows(20);

$(document).ready(function () {
    //game.showResult();
    game.scaleScreen();
    game.intro();
    //game.start();
    //game.bounce();

    if ($(window).height() < 480) {
        $('.play-full-page').css('display', 'block');
    }
});

$(document).on('click', '.stick', function () {
    color.changeColor($(this));
    if ($(this).hasClass('no-effect')) {
        if ($(this).hasClass('bubble-stick')) {
            animation.playBubble($(this));
        } else if ($(this).hasClass('triangle-stick')) {
            animation.playTriangle($(this));
        } else if ($(this).hasClass('block-stick')) {
            animation.playBlock($(this));
        }
        $(this).removeClass('no-effect');
    }
});

$(document).on('click', '.section-2 .bar', function () {
    color.changeColor($(this));
});

$(window).resize(function () {
    if (!userAgent.match(/iPad/i) && !userAgent.match(/iPhone/i)) {
        game.scaleScreenAndRun();
    }
});

$(window).on("orientationchange", function () {
    game.scaleScreenAndRun();
});