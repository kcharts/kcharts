/**
 * overview bar
 * */
KISSY.add("gallery/kcharts/2.0/bar/index",function(S,KCharts,BaseChart,K,BaseUtil){

  //==================== utils ====================
  /**
   * TODO
   * 将 [{name:"第一组",data:[{xval:3,y:"A"},{xval:2,yval:"B"},...]}] for line/bar
   * 转化为
   *    [{name:"第一组",data:[{xval:3,x:2,y:1},{xval:2,x:3,y:3,yval:34},...]}] 最终格式
   *
   * 将series数据转为可用于画barchart的数据
   * @param series {Array}
   *   eg. [{x:"星期一",y:3},...]
   *   eg. [{x:2,y:4},...]
   * @param chartBBox {Object}
   *   - left
   *   - top
   *   - width
   *   - height
   * @param opt
   *   - basevalue {Number} 基线值 默认0
   *   - leftx 画布左下角x
   *   - lefty
   *   - width 画布宽度，除去padding
   *   - height 画布高度，除去padding
   * @return xys {Array}
   *   eg. [{x:x,y;y},...]
   * note:
   *   只要有数据，柱子就要有最小高度，避免看不见.
   * */
  function convertSeriesToPoints(series,chartBbox,opt){
    var values = K.map(series,function(serie){
                   return serie.value;
                 });

    var maxvalue = Math.max.apply(Math,values); // 柱子的最大值
    var minvalue = Math.min.apply(Math,values); // 柱子的最小值

    // 如果是柱状图，可能有
    var basevalue = opt.basevalue || 0; // 基线
    var len = series.length;

    var valuerange; // y值，也就是value跨度
    // 查看基线是否在最大值和最小值之间，来确定valuerange
    if(basevalue < minvalue){
      valuerange = maxvalue - basevalue;
    }else if(basevalue > maxvalue){
      valuerange = basevalue - minvalue;
    }else{
      valuerange = maxvalue - minvalue;
    }

    // 单位value对应的画布高度
    var UNITY = (opt.height - opt.padding.paddingTop - opt.padding.paddingBottom)/valuerange;

    var ys; // 所有的y值
    ys = K.map(series,function(serie){
           return (serie.value - basevalue) * UNITY;
         });
    var width2 = opt.width - opt.paddingx*2;
    var UNITX = width2/(len+1); // x轴有len+1份数

    var xys = [];
    for(var i=0;i<len;i++){
      xys.push({
        x:i*UNITX + opt.paddingx,
        y:ys[i]
      });
    }
    return xys;
  }

  /**
   * 获取柱子信息：柱子宽度、间隔
   * @param width 柱子占据空间宽度
   * @param num 柱子个数
   * @param maxWidth 柱子最大宽度
   * @param maxInterval 最大间隔
   * @param ratio 柱子所占的比率，剩下的就为间隔
   * */
  //==================== end utils ====================

  var Bar = BaseChart.extend({
    initializer:function(){

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

      var chartBBox = this.setChartBBox();
      // 根据图表的左上角位置、图表宽度、高度（如果显示的设置了的话），转换所有的图标点为画布点

      var groupLen = series2.length; // 组个数
      var seriesLen = series2[0].data.length;// 单个组的bar个数

      //==================== 柱子的默认信息 ====================
      var maxWidth = 40
        , maxInterval = 40 // 单个柱形之间的最大间隔
        , maxGroupInterval = 80 // 柱形图组之间的最大间隔
        , r1 = .5  // interval/barwidth = 0.5
        , r2 = 3  // groupInterval/barwidth = 1.5

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

        // var graph = this.get("graph");
        // var paper = graph.get("paper");
        // paper.rect(chartBBox.left+barPadding,chartBBox.top,totalWidth,chartBBox.height);

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
          totalwidth:barwidth+interval
      };

      // series转换到画布上的数据
      // TODO 设置默认rangeConfig值
      var xrangeConfig = {};
      var yrangeConfig = {};

      var convertOption = {};
      convertOption.basevalue = 0;
      convertOption.barPadding = barPadding;

      //==================== 获取range ====================
      var xvalues = [];
      var yvalues = [];
      K.each(series2,function(serie){
        K.each(serie.data,function(xy){
          xvalues.push(xy.xval);
          yvalues.push(xy.yval);
        });
      });
      var xrange = BaseUtil.getRange(xvalues,xrangeConfig);
      var yrange = BaseUtil.getRange(yvalues,yrangeConfig);

      var xvaluerange = xrange.max - xrange.min + 1;
      var yvaluerange = yrange.max - yrange.min + 1;

      //==================== 转换xy值为画布值 ====================
      var series3 = K.map(series2,function(serie,groupIndex){
                      // 产生均匀的x轴刻度划分
                      // var xunit = (chartBBox.width - barPadding*2 + barinfo.interval) / xvaluerange;
                      var yunit = (chartBBox.height) / yvaluerange;
                      var xys = K.map(serie.data,function(xy,barIndex){
                                  var x = groupIndex*(barwidth + interval) + barIndex*(groupLen*barwidth+(groupLen-1)*interval + groupinterval);
                                  return {
                                    x:x,      // bar x刻度算法
                                    y:yunit*xy.yval
                                  };
                                });
                      serie.dataxy = xys;
                      return serie;
                    });
      //==================== 渲染 ====================
      K.each(series3,function(serie,index){
        that._drawBars(serie.dataxy,seriesLen,index,chartBBox,barinfo,convertOption);
      });
    },
    /**
     * @param barOption
     *   - barPadding 填充
     * */
    _drawBars:function(points,groupLen,groupIndex,chartBBox,barinfo,barOption){
      var graph = this.get("graph");
      var paper = graph.get("paper");

      var barwidth = barinfo.barwidth;
      var barPadding = barOption.barPadding;
      var that = this;
      var leftBottomY = chartBBox.top + chartBBox.height ;
      K.each(points,function(p){
        var y = chartBBox.top + chartBBox.height - p.y; // 左下角的y
        var x = p.x+barPadding+chartBBox.left; // 左下角x
        // paper.circle(x,p.y,5);
        // paper.text(x,p.y,p.xstring);
        paper.rect(x,y,barwidth,p.y,0);
      });
    }
  });

  return Bar;
},{
  requires:[
    "gallery/kcharts/2.0/graph/index",
    "gallery/kcharts/2.0/base/index",
    "gallery/kcharts/2.0/adapter/kissy",
    "gallery/kcharts/2.0/base/util"
  ]
});
