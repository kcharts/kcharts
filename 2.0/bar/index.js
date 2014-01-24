/**
 * overview bar
 * */
KISSY.add("gallery/kcharts/2.0/bar/index",function(S,KCharts,BaseChart,K,BaseUtil){

  //==================== utils ====================


  //==================== Class Bar ====================
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

      // series转换到画布上的数据
      // TODO 设置默认rangeConfig值
      var xrangeConfig = {};
      var yrangeConfig = {};

      //==================== range ====================
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

      // 产生均匀的x轴刻度划分，NOTE:bar未用到
      var xunit = (chartBBox.width - barPadding*2 + barinfo.interval) / xvaluerange;
      // 分成上下相等的两部分
      var yunit = (chartBBox.height) / yvaluerange;
      //==================== 转换选项 ====================
      var convertOption = {};
      convertOption.barPadding = barPadding;
      //==================== 转换xy值为画布值 ====================
      var option = {
        m:groupLen,
        n:seriesLen,
        xunit:xunit,
        yunit:yunit,
        barinfo:barinfo,
        chartBBox:chartBBox,
        barPadding:barPadding,
        isbar:true
      };
      var series3 = BaseUtil.convertToCanvasPoint(series2,option);
      //==================== 渲染 ====================
      K.each(series3,function(serie,index){
        that._drawBars(serie.dataxy,seriesLen,index,chartBBox,barinfo,convertOption);
      });
    },
    /**
     * @param barinfo {Object}
     * @param option {Object}
     *   - barPadding 填充
     * */
    _drawBars:function(points,groupLen,groupIndex,chartBBox,barinfo,option){
      var graph = this.get("graph");
      var paper = graph.get("paper");

      var barwidth = barinfo.barwidth;
      var barPadding = option.barPadding;

      var that = this;
      K.each(points,function(p){
        paper.rect(p.x,p.y,p.width,p.height,0);
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
