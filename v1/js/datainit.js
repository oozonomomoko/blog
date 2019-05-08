var en = {
    1: "Mon",
    2: "Tues",
    3: "Wed",
    4: "Thur",
    5: "Fri",
    6: "Sat",
    0: "Sun"
};
var zh = {
    1: "周一",
    2: "周二",
    3: "周三",
    4: "周四",
    5: "周五",
    6: "周六",
    0: "周日"
};

function hasContent(ele) {
    if (ele && ele.textContent && ele.textContent.trim()) {
        return true;
    }
    return false;
}

function contactTrans(src, trans) {
    var len = src.childNodes.length;
    if (len == 0) {
        return;
    }
    for (var i = 0; i < len; i++) {
        if ('#text' == src.childNodes[i].nodeName && hasContent(src.childNodes[i])) {
            src.insertBefore($.parseHTML('<p class="transLine">' + trans.childNodes[i].textContent + '</p>')[0], src.childNodes[i]);
            trans.insertBefore(document.createElement('p'), trans.childNodes[i]);
            i++;
            len++;
        } else {
            contactTrans(src.childNodes[i], trans.childNodes[i])
        }
    }
}
function reloadPath(imgpathBack){
    this.src=imgpathBack;
    this.onerror=null;
}
function replaceImgsrc(ele, imgpath, id) {
    var reg = /\.\.\/\.\.\/photo.*/gi;
    var first = ele.querySelector('img');
    if (!Boolean(first)) {
        return;
    }
    var forJudge = first.src;
    var all = ele.querySelectorAll('img');
    var multiplex = forJudge && reg.test(forJudge);
    var imgMap = {};
    var index = 0;
    for (var j = 0; j < all.length; j++) {
        var img = all[j];
        var old = img.src;
        if (multiplex && imgMap[old]) {
            img.src = imgMap[old];
        } else if (old) {
            var type = old.substr(old.lastIndexOf("."));
            var newSrc = "../blog/" + imgpath + "/" + id + "_" + index + type;
            img.src = newSrc;
            imgMap[old] = newSrc;
        }
        index++;
        img.onerror = function(){
            let bak = imgpath-1;
            this.src=this.src.replace('/'+imgpath+'/', '/'+bak+'/');
            if (j==0) {
                $(".main_list").css("background-image", "url("+this.src+")");
            }
            this.onerror=null;
        };
    }
    var linkall = ele.querySelectorAll('a img');
    if (linkall.length != 0) {
        for (var j = 0; j < linkall.length; j++) {
            linkall[j].parentElement.href = 'javascript:void(0);';
        }
    }
}
var capturing = false;
$(document).ready(function () {
    var isZh = false;
    var href = window.location.href;
    var id = href.split("?")[1].split("&")[0].split("=")[1].split("#")[0];
    function getDetailPic(pic, year){
        return pic.replace(/http.*ikuta\.club\/nogizaka\//,'../').replace(/http.*img\.nogizaka46\.com\/www\/smph\/member\/img/, '../image/head').replace(/\/\d{8}\//,'/'+year+'/');
    }
    $.ajax({
        type: "GET",
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        url: "/blog/data/" + id,
        dataType: "json",
        success: function (detail) {
            var date = new Date(detail.date);
            var year = date.getFullYear();
            var mon = date.getMonth() + 1;
            mon = mon < 10 ? "0" + mon : mon;
            var day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
            var hour = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
            var min = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
            var week = date.getDay();
            
            $(".article_blogkiji .author").text(detail.authorName);
            //$(".ptop a")[0].href = detail.url;

            var conEle = $.parseHTML(detail.content)[0];
            replaceImgsrc(conEle, year, id);
            var copy = $.parseHTML(detail.content)[0];
            replaceImgsrc(copy, year, id);
            if (detail.transTitle) {
                var transEle = $.parseHTML(detail.transContent)[0];
                replaceImgsrc(transEle, year, id);
                contactTrans(conEle, transEle);
            }
            $(".main_list").css("background-image", "url("+getDetailPic(detail.pic, year)+")");
            $(".page_title_in .en").text(detail.authorName);
            $(".page_title_in .jp").text(detail.author.toUpperCase());
            $(".article_blogkiji .title a").attr("href", detail.url);
            $(".profile a").attr("href", '../memberBlog.html#name=' + detail.author);
            if (detail.transTitle) {
                $(".translate").click(function () {
                    document.querySelector(".article_blogkiji .text_area").innerHTML = '';
                    if (isZh) {
                        document.querySelector(".article_blogkiji .text_area").appendChild(copy);
                        $(".article_blogkiji .title a").html(detail.title);
                        $("title").text(detail.title);
                        $(".article_blogkiji .day").text(detail.date + " | " + en[week]);
                    } else if (detail.transTitle) {
                        document.querySelector(".article_blogkiji .text_area").appendChild(conEle);
                        $(".article_blogkiji .title a").html('<p class="transLine">' + detail.transTitle + '</p>' + detail.title);
                        $("title").text(detail.transTitle);
                        $(".article_blogkiji .day").text(detail.date + " | " + zh[week]);
                    }
                    isZh = !isZh;
                    new Nogipic().init(document.querySelector(".article_blogkiji .text_area"));
                });
                $(".translate").click();
            } else {
                $(".translate").hide();
                document.querySelector(".article_blogkiji .text_area").innerHTML = '';
                document.querySelector(".article_blogkiji .text_area").appendChild(copy);
                $(".article_blogkiji .title a").html(detail.title);
                $("title").text(detail.title);
                $(".article_blogkiji .day").text(detail.date + " | " + en[week]);
            }
        }
    });
});
