/**
 * overview 图表基础类
 * */
KISSY.add("gallery/kcharts/2.0/base/index",function(S){
  var Base = S.require("base");

  var BaseChart = Base.extend({
    // 添加widget
    plug:function(widget){
      var graph = this.get("graph");
      var chart = this;

      widget.set({
        graph:graph,
        chart:chart
      });

      widget.render();
    },
    // 移除widget
    unplug:function(){},
    //==================== 基础方法 start ====================
    // 设置图表的绘制区域，多个图表混搭的时候，需要手动设置参数，比如图表的左上角x、y，图表的宽高；单个图表默认占据整个容器
    getBBox:function(){
      var graph = this.get("graph");
      var gwidth = graph.get("containerWidth");
      var gheight = graph.get("containerHeight");
      var pd = this.getPadding();
      var bbox = {
        left:pd.paddingLeft,
        top :pd.paddingTop,
        width:gwidth - pd.paddingLeft - pd.paddingRight,
        height:gheight - pd.paddingTop - pd.paddingBottom
      }
      return bbox;
    },
    // TODO : 可配置
    getPadding:function(){
      return {
        paddingTop:30,
        paddingRight:30,
        paddingBottom:30,
        paddingLeft:30
      };
    },
    // line/scatter:获取x、y轴文案，根据range来计算
    // bar：需要在bar/index.js中重写
    // TODO 根据是否是程序自动产生的数据，来确定是否绘制出x/yaxis文案
    // @param rullerPointsX 计算出的刻度尺X坐标
    // @param option
    //        - xunit
    //        - yunit
    //
    getXYText:function(rullerPointsX,rullerPointsY,option){
      var ret = {};
      var xlabel = [];
      var ylabel = [];

      var xrange = this.get("xrange");
      var yrange = this.get("yrange");

      var bbox = this.getBBox();
      var x0 = bbox.left;
      var y0 = bbox.top + bbox.height;

      xlabel = S.map(xrange.vals,function(xval,i){
                 var p = rullerPointsX[i];
                 return {
                   x:p.x0,
                   y:p.y0,
                   xtext:xval
                 };
               });

      ylabel = S.map(yrange.vals,function(yval,i){
                 var p = rullerPointsY[i];
                 // var y = option.yunit*Math.abs(xy.yval);
                 return {
                   x:p.x0,
                   y:p.y0,
                   ytext:yval
                 };
               });
      ret.xlabel = xlabel;
      ret.ylabel = ylabel;
      return ret;
    }
    //==================== 基础方法 end ====================
  });

  return BaseChart;
});
