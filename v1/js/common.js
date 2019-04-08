"use strict";

function get_ymd(y, m, d) {
    var yyyy = ('0000' + y).slice(-4);
    var mm = ('00' + m).slice(-2);
    var dd = ('00' + d).slice(-2);
    return yyyy + mm + dd;
}
 


// SP Menu
$(".btn-hamburger").on('click', function () {
  if ($(this).hasClass("active")) {
    $(this).parents().find(".header").removeClass("open");
    $(this).removeClass("active")
    $("body").removeClass("hidden");
  } else {
    $(this).parents().find(".header").addClass("open");
    $(this).addClass("active")
    $("body").addClass("hidden");
  }
});

function sliderSetting(){
  var width = $(window).width();
  if(width <= 640){
    $('.slider_topicks').not('.slick-initialized').slick({
      dots: true,
      nfinite: true,
      arrows:false,
      responsive: [
      {
        breakpoint: 640,settings: { //481px～600pxでは2画像表示
          centerMode:true,
          centerPadding: "48px"
        }
      },
      ]
    });
   }else{
      $('.slider_topicks.slick-initialized').slick('unslick');
   }
}
$('.slider_movie').slick({
  dots: true,
  nfinite: true,
  arrows:true,
  infinite: true,
  slidesToShow: 3,
  slidesToScroll: 3,
  responsive: [
  {
    breakpoint: 640,settings: { //481px～600pxでは2画像表示
      arrows:false,
      centerMode:true,
      slidesToShow: 1,
      slidesToScroll: 1,
      centerPadding: "48px"
    }
  },
  ]
});
$('.slider_banner').slick({
  dots: true,
  nfinite: true,
  arrows:true,
  infinite: true,
  slidesToShow: 3,
  slidesToScroll: 3,
  responsive: [
  {
    breakpoint: 640,settings: { //481px～600pxでは2画像表示
      arrows:false,
      centerMode:true,
      slidesToShow: 1,
      slidesToScroll: 1,
      centerPadding: "48px"
    }
  },
  ]
});

function init_top(){
 
  // 初期表示時の実行
  sliderSetting();

  // リサイズ時の実行
  var timer = false;
  $(window).resize(function() {
    if (timer !== false) {
        clearTimeout(timer);
    }
    timer = setTimeout(function() {
      sliderSetting();
    }, 1000);
  });
  /*初期表示*/
  $('.article_schedule .list_group_card').css({"display":"none"});
  $('.article_schedule .list_group_card').eq(0).css({"display":"flex"});
  $('.schedule_day_item').eq(0).addClass('active');

  function load_top_schedule(){

    var num_schedule_day = 7;
    var num_schedule_day_nokori;
    var cnt_schedule_day = $(".schedule_day_group .schedule_day_item.disp").length;
    console.log("cnt_schedule_day===="+cnt_schedule_day);
    var cnt_disp_schedule_day = 0;
    if(cnt_schedule_day < num_schedule_day){
      num_schedule_day_nokori = num_schedule_day - cnt_schedule_day;
      for(var i = 0; i < num_schedule_day_nokori; i++){
        $(".schedule_day_group").append('<li class="schedule_day_item dummy"><div class="date"></div><div class="week"></div></li>');
      }
    }
    /*クリックイベント*/

    var now = new Date();
    var wd = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    var schedule_cnt = $('.schedule_day_item').length;

    var schedule_mont_diff = $('.schedule_day_item:first-child').attr("data-day").substr(0,6);

    var schedule_mont_diff_cnt = 0;

    $('.schedule_day_item').each(function (index) {
      if($(this).hasClass("disp")){
        cnt_disp_schedule_day++;
        if(cnt_disp_schedule_day  > num_schedule_day ){
          $(this).css({"display":"none"});
        }
        var schedule_mont_diff_after = $(this).attr("data-day").substr(0,6);

        console.log("schedule_mont_diff="+schedule_mont_diff);
        console.log("schedule_mont_diff_after="+schedule_mont_diff_after);

        if(schedule_mont_diff === schedule_mont_diff_after){

          $(".year_mont_in",this).css("display","none");


        }else{

          $(".year_mont",this).addClass("year_mont_disp");

          schedule_mont_diff = schedule_mont_diff_after;

          schedule_mont_diff_cnt++;

        }

      }

      $(this).on('click', function () {
        var disp_day = $(this).attr("data-day");
        if($(this).hasClass("dummy")){
          return false;
        }else{
          $('.schedule_day_item').removeClass('active');
          $(this).addClass('active');
          console.log("disp_day="+disp_day);
          $('.article_schedule .list_group_card').css({"display":"none"});
          if($(".list_group_wrap_width").length > 0){
            $('.article_schedule .list_group_wrap_width .list_group_card[data-day="'+disp_day+'"]').css({"display":"block"});
          }else{
            $('.article_schedule .list_group_card[data-day="'+disp_day+'"]').css({"display":"flex"});
          }
        }
      });
    });

    if(schedule_mont_diff_cnt === 0 ){
      
      $(".schedule_day_item .year_mont").remove();

    }


    $('.article_schedule .list_group').each(function(index){
      console.log("article_schedule="+index);
      if($(".list_card",this).length < 3 ){
        var add_nokori = 3 - $(".list_card",this).length;
        console.log("add_nokori="+add_nokori);
        for(var i = 0; i < add_nokori; i++){
          $(this).append('<div class="list_card dummy"><div></div></div>');
        }
      }     
    });
  }
  load_top_schedule();
}

function page_schedule(){
  $('.schedule_day_group_wrap').each(function (index) {
    if($(".list_group .list_card",this).length < 3 ){
      var add_nokori = 3 - $(".list_group .list_card",this).length;
      console.log("add_nokori="+add_nokori);
      for(var i = 0; i < add_nokori; i++){
        $(".list_group",this).append('<div class="list_card dummy"><div></div></div>');
      }
    } 
  });
}

$(function(){

  if ($('#page_top').length > 0) {
    init_top();
  };

  if ($('#page_schedule').length > 0) {
    page_schedule();
  };

  if($('.toggle').length > 0){
    $(".toggle_title").on('click',function() {
      $(this).next().slideToggle("fast");
      $(this).toggleClass("open");
      $(this).toggleClass("active");
    });    
  }
});
