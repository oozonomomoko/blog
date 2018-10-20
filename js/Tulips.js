/**
 * Tulips(郁金香) 图片转拼图游戏插件 nogizaka赛高
 * 
 * version:1.0.0
 * 
 * author:左手掐腰(bilibili)
 * 
 * Copyright 2018.8
 * 
 */
window.Tulips = (function () {
	var Tulip = function () {
		// 主体
		this.mainEle;
		// 行
		this.row = 3;
		// 列
		this.column = 3;
		// 空位(0)的下标
		this.zeroIndex = 8;
		// 当前数组
		this.arr;
		// 初始数组
		this.initArr;

		// 图片信息&元素大小
		this.imgW;
		this.imgH;
		this.unitW;
		this.unitH;
		this.imgSrc;

		// 触摸点记录
		this.startX;
		this.startY;
        
        // 是否判断还原成功
        this.needJudgeSuc = false;
        this.slideEvent = false;
        this.showImg = false;
        this.sucRemove = false;
	};
	Tulip.prototype = {
		/**入参说明
            {
                imgElement: DOM,    //img对象
                row: 3,     //分割行数
                column: 3,  //分割列数
                showImg: false, //是否展示原图片，默认不展示
                slideEvent: true,   //是否绑定滑动事件，默认不绑定
                sucRemove: true,    //拼图成功后是否移除，默认不移除
                success: function(imgElement){} //成功回调
            }
        */
		init: function (config) {
            this.success = config.success;
            this.slideEvent = config.slideEvent ? true : false;
            this.showImg = config.showImg ? true : false;
            this.sucRemove = config.sucRemove ? true : false;
			// 初始化数组
			this.row = config.row ? config.row : this.row;
			this.column = config.column ? config.column : this.column;
			this.arr = [];
			for (var i = 1; i < this.row * this.column; i++) {
				this.arr.push(i);
			}
            // 最后一块图片
			this.arr.push(0);
			this.initArr = this.arr.concat();
			this.zeroIndex = this.row * this.column - 1;

			// 获取图片信息
            var that = this;
			this.imgElement = config.imgElement;
			　　if(this.imgElement.complete) { // 图片已经存在于浏览器缓存
				this.initOperation();　　
			}
			else {
				this.imgElement.onload = function () { //图片加载完成时
					that.initOperation();　　
				}				　　
			}
		},
		initOperation: function () {
			//尺寸初始化
			this.imgW = this.imgElement.width;
			this.imgH = this.imgElement.height;
			//隐藏原图片
            if (!this.showImg) {
                this.imgElement.style.display = 'none';
            }
			this.imgSrc = this.imgElement.src;
			this.unitW = Math.floor(this.imgW / this.column);
			this.unitH = Math.floor(this.imgH / this.row);

			// 页面拼装-外框
			this.mainEle = document.createElement('div');
			this.mainEle.style.width = this.imgW + 'px';
			this.mainEle.style.height = this.imgH + 'px';
			this.mainEle.style['box-shadow'] = '0 0 3px #88309e';
			this.insertAfter(this.mainEle, this.imgElement);

			// 页面拼装-图块
			var htmlStr = '';
			var index = 0;
			for (var i = 0; i < this.row; i++) {
				for (var j = 0; j < this.column; j++) {
					var w = j * this.unitW;
					var h = i * this.unitH;
					if (index + 1 == this.arr.length) {// 最后一块图片
						htmlStr += "<span id='item_" + index + "' style=\"background-image:url('" + this.imgSrc + "');background-position:-"
						 + w + "px -" + h + "px;width:" + (this.unitW - 2) + "px;height:" + (this.unitH - 2) + "px;background-size:"
						 + this.imgW + "px " + this.imgH + "px;top:0px;left:0px;opacity: 0;background-repeat: no-repeat;float: left;position: relative;transition-duration: 0.4s;-moz-transition-duration: 0.4s;-webkit-transition-duration: 0.4s;-o-transition-duration: 0.4s;border-radius: 4px 4px;border: 1px #ecbcf9 solid;\"></span>";
					} else {
						htmlStr += "<span id='item_" + index + "' style=\"background-image:url('" + this.imgSrc + "');background-position:-"
						 + w + "px -" + h + "px;width:" + (this.unitW - 2) + "px;height:" + (this.unitH - 2) + "px;background-size:"
						 + this.imgW + "px " + this.imgH + "px;top:0px;left:0px;background-repeat: no-repeat;float: left;position: relative;transition-duration: 0.4s;-moz-transition-duration: 0.4s;-webkit-transition-duration: 0.4s;-o-transition-duration: 0.4s;border-radius: 4px 4px;border: 1px #ecbcf9 solid;\"></span>";
					}
					index++;
				}
			}
			this.mainEle.innerHTML = htmlStr;
            
            // 打乱排序之后再设置为执行success函数
            this.randomSteps();
            this.needJudgeSuc = true;
            
			//绑定事件
            this.bindClickEvent();
            if (this.slideEvent)
                this.bindSlideEvent();
		},
		/** DOM没有提供的insertAfter()方法 */
		insertAfter: function (newElement, targetElement) {
			var parent = targetElement.parentNode;
			if (parent.lastChild == targetElement) {
				// 如果最后的节点是目标元素，则直接添加。因为默认是最后
				parent.appendChild(newElement);
			} else {
				//如果不是，则插入在目标元素的下一个兄弟节点 的前面。也就是目标元素的后面
				parent.insertBefore(newElement, targetElement.nextSibling);
			}
		},
        /** 随机滑动指定次数 */
        randomSteps: function () {
            var times = this.row * this.column * 5;
            var that = this;
            var count = 0;
            var rdInt = setInterval(function () {
                // 随机数 parseInt(Math.random()*(maxNum-minNum+1)+minNum,10); 
                var direct;
                while(true) {
                    direct = parseInt(Math.random()*4 + 1, 10); 
                    if(1 === direct && that.left())
                        break;
                    else if(2 === direct && that.right())
                        break;
                    else if(3 === direct && that.down())
                        break;
                    else if(4 === direct && that.up())
                        break;
                }
                if (times === count++)
                    clearInterval(rdInt);
            }, 10);
        },
        /** 绑定滑动事件 */
		bindSlideEvent: function () {
            var that = this;
            //记录起点
			that.mainEle.addEventListener('touchstart', function (e) {
                e.preventDefault();
                var touch = e.touches[0];
                that.startX = touch.clientX;
                that.startY = touch.clientY;
            });
			that.mainEle.addEventListener('mousedown', function (e) {
                e.preventDefault();
                that.startX = e.clientX;
                that.startY = e.clientY;
            });
            
            //释放事件
			that.mainEle.addEventListener('touchend', function (e) {
                e.preventDefault();
                var touch = e.changedTouches[0];
                var endX = touch.clientX;
                var endY = touch.clientY;
                that.judgeAction(endX - that.startX, endY - that.startY);
            });
			that.mainEle.addEventListener('mouseup', function (e) {
                e.preventDefault();
                var endX = e.clientX;
                var endY = e.clientY;
                that.judgeAction(endX - that.startX, endY - that.startY);
            });

		},
        /** 绑定点击事件 */
        bindClickEvent: function () {
            var that = this;
            var childs = that.mainEle.childNodes;
            for (var i = 0; i < childs.length; i ++) {
                childs[i].addEventListener('click', function(e){
                    e.preventDefault();
                    e.stopPropagation();
                    //id="item_0"
                    var id = this.id.split('_')[1];
                    if(id == that.zeroIndex) {
                        return;
                    }
                    if(id == that.zeroIndex - 1 && that.zeroIndex%that.column != 0) {
                        that.right();
                    } else if(id == that.zeroIndex + 1 && (that.zeroIndex+1)%that.column != 0) {
                        that.left();
                    } else if(id == that.zeroIndex - that.column) {
                        that.down();
                    } else if(id == that.zeroIndex + that.column) {
                        that.up();
                    }
                    that.judgeSuc();
                });
            }
        },
        /** 根据x,y轴移动距离判断移动方向 */
		judgeAction: function (dx, dy) {
			if (Math.abs(dx) > Math.abs(dy)) {
				if (dx < -2) {
					this.left();
				} else if (dx > 2) {
					this.right();
				}
			} else {
				if (dy < -2) {
					this.up();
				} else if (dy > 2) {
					this.down();
				}
			}
            this.judgeSuc();
		},
        /** 判断是否还原成功 执行用户自定义的success方法 */
        judgeSuc: function () {
			if (this.needJudgeSuc && this.initArr.toString() == this.arr.toString()) {
                this.mainEle.querySelector('#item_' + this.zeroIndex).style.opacity = 1;
                var that = this;
                setTimeout(function(){
                    that.mainEle.outerHTML = that.mainEle.outerHTML;
                }, 500);
                if (this.sucRemove) {
                    this.imgElement.style.display = '';
                    this.remove();
                }
                if ('function' == typeof this.success)
                    this.success(this.imgElement);
            }
        },
        /** remove */
		remove: function () {
            this.mainEle.parentNode.removeChild(this.mainEle);
		},
        /** 向右 */
		right: function () {
			if (this.zeroIndex % this.column == 0) {
				return false;
			}

			var eleIndex = this.zeroIndex - 1;
			var ele = this.mainEle.querySelector('#item_' + eleIndex);
			var zeroEle = this.mainEle.querySelector('#item_' + this.zeroIndex);

			// 动画
			var temp = ele.style.left;
			temp = parseInt(temp.substring(0, temp.length - 2));
			ele.style.left = (temp + this.unitW) + 'px';

			var tempz = zeroEle.style.left;
			tempz = parseInt(tempz.substring(0, tempz.length - 2));
            zeroEle.style.left = (tempz - this.unitW) + 'px';
            
			// 交换id
			zeroEle.id = 'item_' + eleIndex;
			ele.id = 'item_' + this.zeroIndex;

			//数组
			this.arr[this.zeroIndex] = this.arr[eleIndex];
			this.arr[--this.zeroIndex] = 0;
            return true;

		},
        /** 向左 */
		left: function () {
			if ((this.zeroIndex + 1) % this.column == 0) {
				return false;
			}
			var eleIndex = this.zeroIndex + 1;
			var ele = this.mainEle.querySelector('#item_' + eleIndex);
			var zeroEle = this.mainEle.querySelector('#item_' + this.zeroIndex);

			// 动画
			var temp = ele.style.left;
			temp = parseInt(temp.substring(0, temp.length - 2));
			ele.style.left = (temp - this.unitW) + 'px';

			var tempz = zeroEle.style.left;
			tempz = parseInt(tempz.substring(0, tempz.length - 2));
            zeroEle.style.left = (tempz + this.unitW) + 'px';

			// 交换id
			zeroEle.id = 'item_' + eleIndex;
			ele.id = 'item_' + this.zeroIndex;

			this.arr[this.zeroIndex] = this.arr[this.zeroIndex + 1];
			this.arr[++this.zeroIndex] = 0;
            return true;
		},
        /** 向下 */
		down: function () {
			if (this.zeroIndex < this.column) {
				return false;
			}
			var eleIndex = this.zeroIndex - this.column;
			var ele = this.mainEle.querySelector('#item_' + eleIndex);
			var zeroEle = this.mainEle.querySelector('#item_' + this.zeroIndex);

			// 动画
			var temp = ele.style.top;
			temp = parseInt(temp.substring(0, temp.length - 2));
			ele.style.top = (temp + this.unitH) + 'px';

			var tempz = zeroEle.style.top;
			tempz = parseInt(tempz.substring(0, tempz.length - 2));
            zeroEle.style.top = (tempz - this.unitH) + 'px';

			// 交换id
			zeroEle.id = 'item_' + eleIndex;
			ele.id = 'item_' + this.zeroIndex;

			this.arr[this.zeroIndex] = this.arr[this.zeroIndex - this.column];
			this.arr[this.zeroIndex - this.column] = 0;
			this.zeroIndex = this.zeroIndex - this.column;
            return true;
		},
        /** 向上 */
		up: function () {
			if (this.zeroIndex >= this.column * (this.row - 1)) {
				return false;
			}
			var eleIndex = this.zeroIndex + this.column;
			var ele = this.mainEle.querySelector('#item_' + eleIndex);
			var zeroEle = this.mainEle.querySelector('#item_' + this.zeroIndex);

			// 动画
			var temp = ele.style.top;
			temp = parseInt(temp.substring(0, temp.length - 2));
			ele.style.top = (temp - this.unitH) + 'px';

			var tempz = zeroEle.style.top;
			tempz = parseInt(tempz.substring(0, tempz.length - 2));
            zeroEle.style.top = (tempz + this.unitH) + 'px';

			// 交换id
			zeroEle.id = 'item_' + eleIndex;
			ele.id = 'item_' + this.zeroIndex;

			//数组
			this.arr[this.zeroIndex] = this.arr[this.zeroIndex + this.column];
			this.arr[this.zeroIndex + this.column] = 0;
			this.zeroIndex = this.zeroIndex + this.column;
            return true;
		}
	};
	return Tulip;
})();
