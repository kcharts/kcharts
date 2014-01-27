/**
 * overview :
 *   line bar scatter 有很大的相似之处
 * TODO 简化这个大文件
 * */
;KISSY.add("gallery/kcharts/2.0/bar/index",function(S,Raphael,BaseChart,Promise,Anim,BaseUtil,D,E,K){
   //==================== utils start ====================

   //==================== Class Line ====================
   var Line = BaseChart.extend({
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

      // 只有y轴数据时，line需要修正出数据
      series2 = K.map(series2,function(serie){
                  serie.data = BaseUtil.textSeriesToNumberSeries(serie.data)
                  return serie;
                });

      var chartBBox = this.getBBox();
      // 根据图表的左上角位置、图表宽度、高度（如果显示的设置了的话），转换所有的图标点为画布点

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

      // 获取合适的刻度
      var xrange = BaseUtil.getRange(xvalues,xrangeConfig);
      var yrange = BaseUtil.getRange(yvalues,yrangeConfig);

      // for later widget use
      this.set("xrange",xrange);
      this.set("yrange",yrange);

      // var xvaluerange = xrange.max - xrange.min
      // var yvaluerange = yrange.max - yrange.min;

      // 确保有最小range
      // if(xvaluerange < 5){
      //   xvaluerange = 5;
      // }
      // if(yvaluerange < 1){
      //   yvaluerange = 1;
      // }

      // 产生均匀的x轴刻度划分，NOTE:bar未用到
      var xunit = (chartBBox.width) / (xrange.length-1);
      // 分成上下相等的两部分
      var yunit = (chartBBox.height) / (yrange.length);

      //==================== 以上和bar一样 ====================
      var option = {
        chartBBox:chartBBox,
        xunit:xunit,
        yunit:yunit,
        xmin:xrange.min,
        ymin:xrange.min
      };
      var series3 = BaseUtil.convertToCanvasPoint(series2,option);

      //==================== 绘制线条 ====================
      K.each(series3,function(serie,index){
        that.drawLine(serie.dataxy,chartBBox);
      });
    },
    drawLine:function(points){
      var graph = this.get("graph");
      var paper = graph.get("paper");

      var pstr = BaseUtil.polyLine(points,paper);

      paper.path(pstr);
    }
   });


   return Line;
 },{
   requires:[
     "gallery/kcharts/2.0/raphael/index",
     "gallery/kcharts/2.0/base/index",
     "promise",
     "gallery/kcharts/1.3/animate/index",
     "../base/util",
     "dom",
     "event",
     "gallery/kcharts/2.0/adapter/kissy"
   ]
 });
