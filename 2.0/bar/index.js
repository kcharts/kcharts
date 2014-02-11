/**
 * overview bar
 * */
KISSY.add("gallery/kcharts/2.0/bar/index",function(S,Anim,KCharts,BaseChart,K,BaseUtil){

  //==================== utils ====================


  //==================== Class Bar ====================
  var Bar = BaseChart.extend({
    initializer:function(){
      this.chartType = "bar";
    },
    render:function(){
      var that = this;
      // series原始数据
      var series1 = this.get("series") || [];
      // 无数据不进行渲染
      if(series1.length === 0){
        return;
      }
      //==================== 数据格式化 ====================
      // [{name:"第一组",data:[{xval:3,y:"A"},{xval:2,yval:"B"},...]}]
      // series 标准数据格式
      var series2 = BaseUtil.formatSeriesData(series1);

      var chartBBox = this.getBBox();
      // 根据图表的左上角位置、图表宽度、高度（如果显示的设置了的话），转换所有的图标点为画布点

      var groupLen = series2.length; // 组个数
      var seriesLen = series2[0].data.length;// 单个组的bar个数

      //==================== 柱子的默认信息 ====================
      var maxWidth = 40
        , maxInterval = 40 // 单个柱形之间的最大间隔
        , maxGroupInterval = 80 // 柱形图组之间的最大间隔
        , r1 = .5  // interval/barwidth = 0.5
        , r2 = 3   // groupInterval/barwidth = 1.5

      //==================== interval barwidth groupinterval barPadding ====================
      var interval; // bar之间的间隔
      var barwidth; // bar的宽度
      var groupinterval; // 组之间的间隔
      var barPadding = 10; // 合适barPadding，默认为10

      var barRealArea = maxGroupInterval*(groupLen-1) + groupLen * (maxInterval * (seriesLen-1) + maxWidth*seriesLen); // bar 实际占据的空间
      var w1 = barPadding*2 + barRealArea; // 最大宽度
      if(w1 < chartBBox.width){
        barPadding = (chartBBox.width - barRealArea)/2;
        interval = maxInterval;
        groupinterval = maxGroupInterval;
        barwidth = maxWidth;
      }else{
        // 方案一、 [弃用]

        // 方案二、
        // x:barwidth y:interval  z:groupInterval
        // m:组数     n:每组bar数 w:总宽度
        // x*n*m + y*(m-1)*n + z*(n-1) = w
        // y = r1*x;
        // z = r2*x;
        // ==>
        // x*m*n + r1*x(n*m - n) + r2*x(n-1) = w
        // x*m*n + x*(r1*n*m - r*n) + x*(r2*n-r2) = w
        // x*(m*n + r1*n*m - r1*n + r2*n - r2) = w
        // x = w/(m*n + r1*n*m - r1*n + r2*n - r2)
        // y = r1*x
        // z = r2*x
        //

        var totalWidth = chartBBox.width - barPadding*2;

        var n = seriesLen;
        var m = groupLen;
        barwidth = totalWidth/(m*n + r1*n*m - r1*n + r2*n - r2);

        // 修正barwidth
        if(barwidth > maxWidth){
          barwidth = maxWidth;

          interval = r1*barwidth;
          groupinterval = r2*barwidth;

          // 重新计算barPadding
          var barRealArea2 = groupinterval*(groupLen-1) + groupLen * (interval * (seriesLen-1) + barwidth*seriesLen);
          barPadding = (chartBBox.width - barRealArea2)/2;
        }else{
          interval = r1*barwidth;
          groupinterval = r2*barwidth;
        }
      }

      //==================== 一些元信息 ====================
      // 柱信息
      var barinfo = {
          barwidth:barwidth,
          interval:interval,
          groupinterval:groupinterval,
          totalwidth:barwidth+interval
      };
      // for later use
      this.set("@barinfo",barinfo);

      // series转换到画布上的数据
      // TODO 设置默认rangeConfig值
      var xrangeConfig = {};
      var yrangeConfig = {min:0}; // bar强制从0开始算

      //==================== range ====================
      var xvalues = [];
      var yvalues = [];
      K.each(series2,function(serie){
        K.each(serie.data,function(xy){
          xvalues.push(xy.xval);
          yvalues.push(xy.yval);
        });
      });
      // 获取合适的刻度
      var xrange = BaseUtil.getRange(xvalues,xrangeConfig);
      var yrange = BaseUtil.getRange(yvalues,yrangeConfig);

      // for later widget use
      this.set("xrange",xrange);
      this.set("yrange",yrange);

      var xvaluerange = xrange.max - xrange.min;
      var yvaluerange = yrange.max - yrange.min;

      if(xvaluerange === 0){
        xvaluerange = 1;
      }

      if(yvaluerange === 0){
        yvaluerange = 1;
      }

      // 产生均匀的x轴刻度划分，NOTE:bar未用到
      // var xunit = (chartBBox.width - barPadding*2 + barinfo.interval) / xvaluerange;
      var xunit = (chartBBox.width - barPadding*2 + barinfo.interval) / xvaluerange;
      var yunit = (chartBBox.height) / yvaluerange;

      // for later use
      this.set("@xunit",xunit);
      this.set("@yunit",yunit);

      //==================== 转换选项 ====================
      var convertOption = {};
      convertOption.barPadding = barPadding;
      //==================== 转换xy值为画布值 ====================
      var option = {
        m:groupLen,
        n:seriesLen,
        xunit:xunit,
        yunit:yunit,
        xmin:xrange.min,
        ymin:yrange.min,
        barinfo:barinfo,
        chartBBox:chartBBox,
        barPadding:barPadding,
        biDirection:this.get("biDirection"), // 双向柱状图标记
        isbar:true
      };
      // console.log(JSON.stringify(series2));
      var series3 = BaseUtil.convertToCanvasPoint(series2,option);
      //==================== 渲染 ====================
      K.each(series3,function(serie,index){
        // TODO configureable
        // 1. 同步绘制
        that.syncDrawBars(serie,seriesLen,index,chartBBox,barinfo,convertOption);

        // 2. 动画异步绘制
        // that.asyncDrawBars(serie.dataxy,seriesLen,index,chartBBox,barinfo,convertOption);
      });

      // 保存处理后过后的数据
      // 内部数据用@开始
      // 使用到的地方：无
      this.set("@series",series3);

      // 获取label文案信息
      // console.log(JSON.stringify(this.getXYText()));
    },
    // 重写base.js的方法
    getXYText:function(rullerPointsX,rullerPointsY,option){
      var ret = {};
      var xlabel = [];
      var ylabel = [];

      var bbox = this.getBBox();
      var barinfo = this.get("@barinfo");

      var x0 = bbox.left;
      var y0 = bbox.top + bbox.height;

      var series3 = this.get("@series",series3);

      // x轴上的文案
      K.each(series3,function(serie,index){
        K.each(serie.dataxy,function(p,i){
          xlabel.push({
            x:p.x+barinfo.barwidth/2,
            y:y0,
            xtext:p.xtext
          });
        });
      });

      var yrange = this.get("yrange");
      ylabel = S.map(yrange.vals,function(yval,i){
                 var p = rullerPointsY[i];
                 // var y = option.yunit*Math.abs(xy.yval);
                 return {
                   x:p.x0,
                   y:p.y0,
                   // TODO 可自定义配置
                   ytext:yval.toFixed(2)
                 };
               });
      ret.xlabel = xlabel;
      ret.ylabel = ylabel;
      return ret;
    },
    /**
     * @param barinfo {Object}
     * @param option {Object}
     *   - barPadding 填充
     * */
    syncDrawBars:function(serie,groupLen,groupIndex,chartBBox,barinfo,option){
      var graph = this.get("graph");
      var paper = graph.get("paper");

      var points = serie.dataxy;

      var barwidth = barinfo.barwidth;
      var barPadding = option.barPadding;

      K.each(points,function(p){
        paper.rect(p.x,p.y,p.width,p.height,0);
      });
    },
    asyncDrawBars:function(points,groupLen,groupIndex,chartBBox,barinfo,option){
      var graph = this.get("graph");
      var paper = graph.get("paper");

      var barwidth = barinfo.barwidth;
      var barPadding = option.barPadding;
      //==================== same as syncDrawBar ====================

      var $bars = []; // raphael rect实例，高度为0的矩形
      K.each(points,function(p){
        var y = p.y;
        if(!p.revert){
          y = y - p.height;
        }
        paper.circle(p.x,p.y,3);
        $bars.push(
          paper.rect(p.x,y,p.width,0,0)
        );
      });

      // KISSY 1.4.0 开始支持自定义动画[contribute by yuanhuang, yeah!] ，没必要再像之前KCharts1.2那样自己搞一套动画
      //
      var anim = new Anim(
        {r: 0}, // r:0  ->  r:1 ，任意值皆可，仅仅是为了获取fx.pos，fx.pos是一个 [0,1] 范围内的数，所以其实这里没有用到r
        {r: 1}, {
          // TODO effect configureable !
          easing: "swing",
          duration: 0.6,
          frame: function (anim, fx) {
            K.each($bars,function($bar,i){
              var point = points[i];
              var revert = point.revert;

              var pos = fx.pos;

              var x = point.x
                , y = point.y
                , w = point.width
                , h = point.height; // 柱子最终高度

              var h0 = h*pos; // 柱子过度高度

              if(revert){ // 柱子朝下
                // y = y + h0;
                $bar.attr({
                  height:h0
                });
              }else{ // 柱子朝上
                y = y + h - h0;// 修正y值
                $bar.attr({
                  height:h0,
                  y:y
                });
              }
            });
          }
        }
      );
      anim.run();
      // 我要的promise，直觉的有了
      // anim.then(function(){
      //   console.log('anim done');
      // });
      return anim;
    }
  });
  return Bar;
},{
  requires:[
    "anim",
    "gallery/kcharts/2.0/graph/index",
    "gallery/kcharts/2.0/base/index",
    "gallery/kcharts/2.0/adapter/kissy",
    "gallery/kcharts/2.0/base/util"
  ]
});
