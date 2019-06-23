/**
 * Nogipic 图片插件
 *
 * version:1.0.0
 *
 * author:左手掐腰
 *
 * Copyright 2019.3
 *
 */
window.Nogipic = (function () {
	let Nogipic = function () {
        this.scaleLast = 1;
    };
	Nogipic.prototype = {
		init: function (ele) {
            /*
                1.传入单个img对象
                2.传入单个非img对象，将查找其下所有img对象
                3.传入数组，其中的每个对象，如果是img对象，同1；
                    如果是非img对象，则查找其下第一个img，不存在则忽略，且点击事件绑定于此对象上，而不是img对象上
            */
			if (!ele)
				return;
			let eles = [];
            let eventEles = [];
            
			if (!ele.length && ele.length !=0) {
				if (ele.tagName != 'img')
					eles = ele.querySelectorAll('img');
                else
					eles.push(ele);
                eventEles = eles;
			} else {
				for (let i = 0; i < ele.length; i++) {
					if (ele[i].tagName == 'img') {
                        eles.push(ele[i]);
                        eventEles = eles;
                    } else {
                        let imgsTmp = ele[i].querySelectorAll('img');
                        if (imgsTmp) {
                            eles.push(imgsTmp[0]);
                            eventEles.push(ele[i]);
                        }
                    }
				}
			}
			if (eles.length === 0)
				return;

			this.rootEle = document.querySelector('.nogipic');
            if (this.rootEle)
                this.rootEle.remove();

            this.rootEle = document.createElement('div');
            this.imgEle = document.createElement('img');
            this.rootEle.appendChild(this.imgEle);
            this.rootEle.className = 'nogipic';
            document.body.appendChild(this.rootEle);

            // 样式
            if (!document.getElementById('nogipicstyle')) {
                let style = document.createElement('style');
                style.setAttribute('id', 'nogipicstyle');
                style.innerHTML='.nogipic{position:fixed;display:none;left:0;top:0;width:100%;height:100%;z-index:99999;background-color:rgba(128, 128, 128, 0.6);}.nogipic img{margin:0 auto;position:absolute;}';
                document.body.appendChild(style);
            }
			var that = this;
			for (let i = 0; i < eles.length; i++) {
                let url = eles[i].src;
				eventEles[i].addEventListener('click', function() {
					that.imgEle.src = url;
					that.rootEle.style.display = 'block';
                    that.imgEle.style.width = window.innerWidth + 'px';
                    if(window.innerHeight>that.imgEle.height){
                        that.imgEle.style.marginTop = (window.innerHeight-that.imgEle.height)/2+'px';
                    }
				});
			}
            this.bindDrag();
		},
        bindDrag: function(){
            var TRANSFORM = 'transform';
            if (typeof document.body.style.webkitTransform !== undefined) {
                TRANSFORM = 'webkitTransform';
            }
            
            let that = this;
            function mousedown(e){
                that.imgEle.style.transition = 'none';
                e.preventDefault();
                if(e.touches){
                    if(e.touches.length === 2) {
                        //移动
                        that.pageX = (e.touches[0].pageX + e.touches[1].pageX)/2;
                        that.pageY = (e.touches[0].pageY + e.touches[1].pageY)/2;
                        //缩放
                        that.startDistance = getDistance(e.touches[0].pageX, e.touches[0].pageY, e.touches[1].pageX, e.touches[1].pageY);
                    }
                    else if(e.touches.length === 1) {
                        that.startX = e.touches[0].pageX;
                        that.pageX = e.touches[0].pageX;
                        that.startY = e.touches[0].pageY;
                        that.pageY = e.touches[0].pageY;
                    }
                } else {
                    that.pageX = e.pageX;
                    that.pageY = e.pageY;
                    that.startX = e.pageX;
                    that.startY = e.pageY;
                }
                that.timeStamp = e.timeStamp;
                this.addEventListener('mousemove', mousemove);
                this.addEventListener('touchmove', mousemove, {passive:false});
                this.addEventListener('mouseup', mouseup);
                this.addEventListener('touchend', mouseup);
                
            }
            function mousemove(e){
                e.preventDefault();
                if(e.touches){
                    if(e.touches.length === 2) {
                        let currDistance = getDistance(e.touches[0].pageX, e.touches[0].pageY, e.touches[1].pageX, e.touches[1].pageY);
                        that.scale = currDistance/that.startDistance * that.scaleLast;
                        that.imgEle.style[TRANSFORM] = 'scale(' + that.scale +')';
                        let currX = (e.touches[0].pageX + e.touches[1].pageX)/2;
                        let currY = (e.touches[0].pageY + e.touches[1].pageY)/2;
                        that.imgEle.style.marginLeft = getMarginLeft() + currX - that.pageX +'px';
                        that.imgEle.style.marginTop = getMarginTop() + currY-that.pageY +'px';
                        that.pageX = currX;
                        that.pageY = currY;
                    }
                    else if(e.touches.length === 1) {
                        that.imgEle.style.marginLeft = getMarginLeft() + e.touches[0].pageX-that.pageX +'px';
                        that.imgEle.style.marginTop = getMarginTop() + e.touches[0].pageY-that.pageY +'px';
                        that.pageX = e.touches[0].pageX;
                        that.pageY = e.touches[0].pageY;
                    }
                } else {
                    that.imgEle.style.marginLeft = getMarginLeft() + e.pageX-that.pageX +'px';
                    that.imgEle.style.marginTop = getMarginTop() + e.pageY-that.pageY +'px';
                    that.pageX = e.pageX;
                    that.pageY = e.pageY;
                }
            }
            function getDistance(x1,y1,x2,y2){
                return Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1- y2), 2));
            }
            function getMarginLeft(){
                return Number(that.imgEle.style.marginLeft.replace('px',''));
            }
            function getMarginTop(){
                return Number(that.imgEle.style.marginTop.replace('px',''));
            }
            function mouseup(e){
                that.imgEle.style.transition = '0.35s';
                // 记录本次放大倍数
                that.scaleLast = that.scale?that.scale:1;
                if(that.scaleLast > 3){
                    that.scaleLast = 3;
                } else if(that.scaleLast < 1) {
                    that.scaleLast = 1;
                }
                that.imgEle.style[TRANSFORM] = 'scale('+that.scaleLast+')';
                
                // 左右边界
                let offsetX = (that.scaleLast-1)*window.innerWidth/2;
                let marginLeft = getMarginLeft();
                if (marginLeft-offsetX > 0){
                    that.imgEle.style.marginLeft = offsetX + 'px';
                } else if(marginLeft+offsetX < 0) {
                    that.imgEle.style.marginLeft = -offsetX + 'px';
                }
                
                
                // 弹出层点击消失
                let rangeDistance = getDistance(that.pageX, that.pageY, that.startX, that.startY);
                let rangeTime = e.timeStamp - that.timeStamp;
                console.log(rangeTime + ':' + rangeDistance);
                if (rangeTime < 200 && rangeDistance < 50){
                    that.rootEle.style.display = 'none';
                    that.imgEle.style.marginLeft = '';
                    that.imgEle.style.marginTop = '';
                    that.imgEle.style[TRANSFORM] = 'scale(1)';
                }
                this.removeEventListener('mousemove', mousemove);
                this.removeEventListener('touchmove', mousemove, {passive:false});
                this.removeEventListener('mouseup', mouseup);
                this.removeEventListener('touchend', mouseup);
            }
            this.rootEle.addEventListener('mousedown', mousedown);
            this.rootEle.addEventListener('touchstart', mousedown, {passive:false});
        }
	};
	return Nogipic;
})();
