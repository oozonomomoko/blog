/**
 * Nogipic 图片插件
 *
 * version:1.0.0
 *
 * author:左手掐腰 @bilibili.com
 *
 * Copyright 2019.3
 *
 */
window.Nogipic = (function () {
	let Nogipic = function () {
        this.scaleLast = 1;
        this.MAX_SCALE = 3;
        this.BG_WORD = 'NOGIZAKA46';
    };
	Nogipic.prototype = {
		init: function (ele, maxScale, backgroundWord) {
            /*
            ele:
                1.传入单个img对象，点击事件绑定在img本身；
                2.传入单个非img对象，将查找其下所有img对象，点击事件绑定在img本身；
                3.传入数组，点击事件绑定在其中的每个对象上。对于其中的每一个对象，如果不是img，则查找其下第一个img，不存在则忽略。
            maxScale: 
                最大放大倍数
            backgroundWord:
                背景文字
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
					if (ele[i].tagName.toLowerCase() == 'img') {
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
            this.MAX_SCALE = maxScale?maxScale:this.MAX_SCALE;
            this.BG_WORD = backgroundWord?backgroundWord:this.BG_WORD;
            
            //DOM
			this.rootEle = document.querySelector('.nogipic');
            if (!this.rootEle) {
                this.rootEle = document.createElement('div');
                this.span = document.createElement('span');
                this.imgEle = document.createElement('img');
                this.imgEle.style.transition = '0.5s';
                this.img = document.createElement('img');
                this.img.style.opacity = 0;
                this.span.appendChild(this.imgEle);
                this.span.appendChild(this.img);
                this.rootEle.className = 'nogipic';
                this.preEle = document.createElement('div');
                this.preEle.className = 'pre';
                this.nxtEle = document.createElement('div');
                this.nxtEle.className = 'nxt';
                this.pageEle = document.createElement('div');
                this.pageEle.className = 'page';
                this.rootEle.appendChild(this.pageEle);
                this.rootEle.appendChild(this.preEle);
                this.rootEle.appendChild(this.span);
                this.rootEle.appendChild(this.nxtEle);
                this.TRANSFORM = 'transform';
                if (typeof document.body.style.webkitTransform !== undefined) {
                    TRANSFORM = 'webkitTransform';
                }
                document.body.appendChild(this.rootEle);
                // 绑定事件：拖拽 缩放 前 后 
                // bind events: drag scale previous next close
                this.bindDrag();
            }

            //style
            if (!document.getElementById('nogipicstyle')) {
                let style = document.createElement('style');
                style.id = 'nogipicstyle';
                style.innerHTML='.nogipic{border:none;position:fixed;display:none;left:0;top:0;width:100%;height:100%;z-index:99999;background-color:rgba(0,0,0,.8)}.nogipic:before{content:"'+this.BG_WORD+'";height:100%;width:100%;text-align:center;color:#424242;font-size:1rem;position:fixed;overflow-wrap:break-word}.nogipic img{transition:0.3s;width:auto;height:auto;position:fixed;max-width:100%;max-height:100%;display:block}.nogipic span{display:block}.nogipic div{color:#fff;text-shadow:0 0 3px #000;text-align:center;position:fixed;height:20%;width:50%;top:80%;z-index:1000;border:none}.nogipic .pre{left:0;}.nogipic .nxt{right:0;}.nogipic .page{top:90%;width:100%}.nogipic .nxt:before{content:" ";top:50%;position:absolute;border-top:10px;border-bottom:10px;border-color:rgba(0,0,0,0);border-style:solid;border-left:#fcc6ff 10px solid}.nogipic .pre:before{content:" ";top:50%;position:absolute;border-top:10px;border-bottom:10px;border-color:rgba(0,0,0,0);border-style:solid;border-right:#fcc6ff 10px solid}.loading:after{top:50%;content:" ";border:1em solid transparent;border-left-color:purple;border-right-color:green;-webkit-animation:1s loader-02 linear infinite;animation:1.5s loader-02 linear infinite;position:fixed;left:50%;}@-webkit-keyframes loader-02{0%{-webkit-transform:rotate(0deg);transform:rotate(0deg);border-left-color:purple;border-right-color:green;}50%{border-left-color:green;border-right-color:purple;}100%{-webkit-transform:rotate(360deg);transform:rotate(360deg);border-left-color:purple;border-right-color:green;}}@keyframes loader-02{0%{-webkit-transform:rotate(0deg);transform:rotate(0deg);border-left-color:purple;border-right-color:green;}50%{border-left-color:green;border-right-color:purple;}100%{-webkit-transform:rotate(360deg);transform:rotate(360deg);border-left-color:purple;border-right-color:green;}}';
                document.body.appendChild(style);
            }
            
            //event:click to show image
			var that = this;
			for (let i = 0; i < eles.length; i++) {
                let idx = i;
				eventEles[i].onclick = function() {
                    that.showImg(idx);
				};
			}
		},
        adjustPos: function(){
            let w = this.getImgWidth();
            let h = this.getImgHeight();
            let actH = h*this.scaleLast;
            let actW = w*this.scaleLast;
            let mt = this.getMarginTop();
            let ml = this.getMarginLeft();
            let maxT = (this.scaleLast-1)*h/2;
            let minT = window.innerHeight-maxT-h;
            let maxL = (this.scaleLast-1)*w/2;
            let minL = window.innerWidth-maxL-w;
            if (actH<window.innerHeight)
                this.imgEle.style.marginTop = (window.innerHeight-h)/2+'px';
            else if(mt>maxT)
                this.imgEle.style.marginTop = maxT+'px';
            else if(mt<minT)
                this.imgEle.style.marginTop = minT+'px';
            if (actW<window.innerWidth)
                this.imgEle.style.marginLeft = (window.innerWidth-w)/2+'px';
            else if(ml>maxL)
                this.imgEle.style.marginLeft = maxL+'px';
            else if(ml<minL)
                this.imgEle.style.marginLeft = minL+'px';
        },
        showImg: function(idx){
            this.idx = idx;
            this.span.className = 'loading';
            this.imgEle.style.opacity = '0.5';
            this.img.src = this.eles[idx].src;
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
        getImgWidth: function (){
            return Number(this.imgEle.style.width.replace('px',''));
        },
        getImgHeight: function (){
            return Number(this.imgEle.style.height.replace('px',''));
        },
        bindDrag: function(){
            let that = this;
            function mousedown(e){
                if(2==e.button){
                    that.noaction = true;
                    return;
                }
                if (that.noaction){
                    that.noaction = false;
                    return;
                }
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
                if (that.downloadTimer)
                    window.clearTimeout(that.downloadTimer);
                that.downloadTimer = window.setTimeout(function(){
                    let a = document.createElement('a');
                    let url = that.eles[that.idx].src;
                    a.href = url;
                    
                    let lidx = url.lastIndexOf('/');
                    if(-1!=lidx){
                        a.download = url.substring(lidx+1);
                    } 
                    a.setAttribute('target','_blank');
                    a.click();
                    a.remove();
                    that.rootEle.removeEventListener('mousemove', mousemove);
                    that.rootEle.removeEventListener('touchmove', mousemove, {passive:false});
                    that.rootEle.removeEventListener('mouseup', mouseup);
                    that.rootEle.removeEventListener('touchend', mouseup);
                },800);
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
                        that.lastDistance = currDistance;
                    }else if(e.touches.length === 1) {
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
                //移动距离超过20，则不下载图片
                if(that.downloadTimer&&getDistance(that.pageX, that.pageY, that.startX, that.startY)>20){
                    window.clearTimeout(that.downloadTimer);
                    that.downloadTimer = null;
                }
            }
            function getDistance(x1,y1,x2,y2){
                return Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1- y2), 2));
            }
            function mouseup(e){
                // 记录本次放大倍数
                that.scaleLast = that.scale?that.scale:that.scaleLast;
                if(that.scaleLast > that.MAX_SCALE){
                    that.scaleLast = that.MAX_SCALE;
                } else if(that.scaleLast < 1) {
                    that.scaleLast = 1;
                }
                that.imgEle.style.transition = '0.3s';
                that.imgEle.style[TRANSFORM] = 'scale('+that.scaleLast+')';
                // 弹出层单击事件 前|后|关闭
                let rangeDistance = getDistance(that.pageX, that.pageY, that.startX, that.startY);
                let rangeTime = e.timeStamp - that.timeStamp;
                if (rangeTime < 300 && rangeDistance < 20){
                    if (e.target.className == 'pre') {
                        that.showImg(that.idx==0?that.eles.length-1:that.idx-1);
                    } else if (e.target.className == 'nxt') {
                        that.showImg(that.idx==that.eles.length-1?0:that.idx+1);
                    } else {
                        that.close();
                        that.imgEle.style.marginLeft = '';
                        that.imgEle.style.marginTop = '';
                        that.imgEle.style[TRANSFORM] = 'scale(1)';
                    }
                } else {
                    /*if (Math.abs(that.pageX-that.startX)>100){
                        if (that.pageX > that.startX) {
                            that.showImg(that.idx==0?that.eles.length-1:that.idx-1);
                        } else if (that.pageX < that.startX) {
                            that.showImg(that.idx==that.eles.length-1?0:that.idx+1);
                        }
                    }*/
                    // 调整位置
                    that.adjustPos();
                }
                window.clearTimeout(that.downloadTimer);
                that.downloadTimer = null;
                this.removeEventListener('mousemove', mousemove);
                this.removeEventListener('touchmove', mousemove, {passive:false});
                this.removeEventListener('mouseup', mouseup);
                this.removeEventListener('touchend', mouseup);
            }
            this.rootEle.addEventListener('mousedown', mousedown);
            this.rootEle.addEventListener('touchstart', mousedown, {passive:false});
            this.rootEle.addEventListener('mousewheel', function(e){
                e.preventDefault();
                let wheelDelta = e.detail?e.detail:e.wheelDelta;
                if(wheelDelta>0)
                    that.scaleLast += 0.2;
                else if(wheelDelta<0)
                    that.scaleLast -=0.2;
                if(that.scaleLast>that.MAX_SCALE)
                    that.scaleLast = that.MAX_SCALE;
                else if (that.scaleLast<1)
                    that.scaleLast = 1;
                that.imgEle.style[TRANSFORM] = 'scale(' + that.scaleLast +')';
                that.adjustPos();
            }, {passive:false});
            window.onresize = function(){if(that.show)that.showImg(that.idx);};
            document.body.addEventListener('keydown', function(e){
                if (that.show) {
                    if(e.keyCode == 37){
                        e.preventDefault();
                        that.showImg(that.idx==0?that.eles.length-1:that.idx-1);
                    }else if(e.keyCode == 39){
                        e.preventDefault();
                        that.showImg(that.idx==that.eles.length-1?0:that.idx+1);
                    }else if(e.keyCode == 27){
                        e.preventDefault();
                        that.close();
                    }
                }
            });
            // 更换图片后调整位置
            this.img.onload = function(){
                that.span.className = '';
                that.imgEle.style.opacity = 1;
                that.imgEle.style[that.TRANSFORM] = 'scale(1)';
                that.scaleLast = 1;
                that.imgEle.style.width = this.width+'px';
                that.imgEle.style.height = this.height+'px';
                that.adjustPos();
                that.imgEle.src = this.src;
            }
        },
        close:function(){
            if (this.rootEle)
                this.rootEle.style.display='none';
            this.show = false;
        }
	};
	return Nogipic;
})();
