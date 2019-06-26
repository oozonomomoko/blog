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
            this.eles = eles;
			this.rootEle = document.querySelector('.nogipic');
            if (this.rootEle)
                this.rootEle.remove();

            this.rootEle = document.createElement('div');
            let span = document.createElement('span');
            this.imgEle = document.createElement('img');
            this.imgEle.style.transition = '0.5s';
            span.appendChild(this.imgEle);
            this.rootEle.className = 'nogipic';
            this.preEle = document.createElement('div');
            this.preEle.className = 'pre';
            this.nxtEle = document.createElement('div');
            this.nxtEle.className = 'nxt';
            this.pageEle = document.createElement('div');
            this.pageEle.className = 'page';
            this.rootEle.appendChild(this.pageEle);
            this.rootEle.appendChild(this.preEle);
            this.rootEle.appendChild(span);
            this.rootEle.appendChild(this.nxtEle);
            this.TRANSFORM = 'transform';
            if (typeof document.body.style.webkitTransform !== undefined) {
                TRANSFORM = 'webkitTransform';
            }
            document.body.appendChild(this.rootEle);

            // 样式
            if (!document.getElementById('nogipicstyle')) {
                let style = document.createElement('style');
                style.setAttribute('id', 'nogipicstyle');
                style.innerHTML='.nogipic{border:none;position:fixed;display:none;left:0;top:0;width:100%;height:100%;z-index:99999;background-color:rgba(0,0,0,.8)}.nogipic img{width:auto;   height:auto;position:fixed;max-width:100%;max-height:100%;display:block}.nogipic span{display:block}.nogipic div{color:#fff;text-shadow:0 0 3px #000;text-align:center;position:fixed;height:20%;width:50%;top:80%;z-index:1000;border:none}.nogipic .pre{left:0;background-color:rgba(255,255,255,.3)}.nogipic .nxt{right:0;background-color:rgba(255,255,255,.3)}.nogipic .page{top:90%;width:100%}.nogipic .pre:before{content:"<";top:50%;position:absolute;transform:scale(1.5)}.nogipic .nxt:before{content:">";top:50%;position:absolute;transform:scale(1.5)}';
                document.body.appendChild(style);
            }
			var that = this;
            // 更换图片后调整位置
            this.imgEle.onload = function(){
                that.adjustPos();
            }
			for (let i = 0; i < eles.length; i++) {
                let idx = i;
				eventEles[i].onclick = function() {
                    that.showImg(idx);
				};
			}
            // 拖拽 缩放 前 后
            this.bindDrag();
		},
        adjustPos: function(){
            let actH = this.imgEle.height*this.scaleLast;
            let actW = this.imgEle.width*this.scaleLast;
            let mt = this.getMarginTop();
            let ml = this.getMarginLeft();
            let maxT = (this.scaleLast-1)*this.imgEle.height/2;
            let minT = window.innerHeight-maxT-this.imgEle.height;
            let maxL = (this.scaleLast-1)*this.imgEle.width/2;
            let minL = window.innerWidth-maxL-this.imgEle.width;
            if (actH<window.innerHeight)
                this.imgEle.style.marginTop = (window.innerHeight-this.imgEle.height)/2+'px';
            else if(mt>maxT)
                this.imgEle.style.marginTop = maxT+'px';
            else if(mt<minT)
                this.imgEle.style.marginTop = minT+'px';
            if (actW<window.innerWidth)
                this.imgEle.style.marginLeft = (window.innerWidth-this.imgEle.width)/2+'px';
            else if(ml>maxL)
                this.imgEle.style.marginLeft = maxL+'px';
            else if(ml<minL)
                this.imgEle.style.marginLeft = minL+'px';
        },
        showImg: function(idx){
            this.idx = idx;
            this.imgEle.src = '';
            this.imgEle.src = this.eles[idx].src;
            this.imgEle.style[this.TRANSFORM] = 'scale(1)';
            this.scaleLast = 1;
            this.rootEle.style.display = 'block';
            this.pageEle.textContent = (idx+1) + '/' + this.eles.length;
            this.show = true;
        },
        getMarginLeft: function (){
            return Number(this.imgEle.style.marginLeft.replace('px',''));
        },
        getMarginTop: function (){
            return Number(this.imgEle.style.marginTop.replace('px',''));
        },
        bindDrag: function(){
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
                        that.imgEle.style.marginLeft = that.getMarginLeft() + currX-that.pageX +'px';
                        that.imgEle.style.marginTop = that.getMarginTop() + currY-that.pageY +'px';
                        that.pageX = currX;
                        that.pageY = currY;
                    }
                    else if(e.touches.length === 1) {
                        that.imgEle.style.marginLeft = that.getMarginLeft() + e.touches[0].pageX-that.pageX +'px';
                        that.imgEle.style.marginTop = that.getMarginTop() + e.touches[0].pageY-that.pageY +'px';
                        that.pageX = e.touches[0].pageX;
                        that.pageY = e.touches[0].pageY;
                    }
                } else {
                    that.imgEle.style.marginLeft = that.getMarginLeft() + e.pageX-that.pageX +'px';
                    that.imgEle.style.marginTop = that.getMarginTop() + e.pageY-that.pageY +'px';
                    that.pageX = e.pageX;
                    that.pageY = e.pageY;
                }
            }
            function getDistance(x1,y1,x2,y2){
                return Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1- y2), 2));
            }
            function mouseup(e){
                that.imgEle.style.transition = '0.6s';
                // 记录本次放大倍数
                that.scaleLast = that.scale?that.scale:that.scaleLast;
                if(that.scaleLast > 3){
                    that.scaleLast = 3;
                } else if(that.scaleLast < 1) {
                    that.scaleLast = 1;
                }
                that.imgEle.style[TRANSFORM] = 'scale('+that.scaleLast+')';
                
                // 左右边界
                that.adjustPos();
                // 弹出层单击事件 前|后|关闭
                let rangeDistance = getDistance(that.pageX, that.pageY, that.startX, that.startY);
                let rangeTime = e.timeStamp - that.timeStamp;
                if (rangeTime < 200 && rangeDistance < 30){
                    if (e.target.className == 'pre') {
                        if(that.idx==0)
                            that.showImg(that.eles.length-1);
                        else
                            that.showImg(that.idx-1);
                        
                    } else if (e.target.className == 'nxt') {
                        if(that.idx==that.eles.length-1)
                            that.showImg(0);
                        else
                            that.showImg(that.idx+1);
                    } else {
                        that.close();
                        that.imgEle.style.marginLeft = '';
                        that.imgEle.style.marginTop = '';
                        that.imgEle.style[TRANSFORM] = 'scale(1)';
                    }
                }
                this.removeEventListener('mousemove', mousemove);
                this.removeEventListener('touchmove', mousemove, {passive:false});
                this.removeEventListener('mouseup', mouseup);
                this.removeEventListener('touchend', mouseup);
            }
            this.rootEle.addEventListener('mousedown', mousedown);
            this.rootEle.addEventListener('touchstart', mousedown, {passive:false});
            this.rootEle.onmousewheel = function(e){
                e.preventDefault();
                let wheelDelta = e.detail?e.detail:e.wheelDelta;
                if(wheelDelta>0)
                    that.scaleLast += 0.1;
                else if(wheelDelta<0)
                    that.scaleLast -=0.1;
                if(that.scaleLast>3)
                    that.scaleLast = 3;
                else if (that.scaleLast<1)
                    that.scaleLast = 1;
                that.imgEle.style[TRANSFORM] = 'scale(' + that.scaleLast +')';
                that.adjustPos();
            };
            window.onresize = function(){if(that.show)that.showImg(that.idx);};
        },
        close:function(){
            if (this.rootEle)
                this.rootEle.style.display='none';
            this.show = false;
        }
	};
	return Nogipic;
})();
