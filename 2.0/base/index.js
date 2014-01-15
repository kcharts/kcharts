/**
 * overview 图表基础类
 * */
KISSY.add("gallery/kcharts/2.0/base/index",function(S){
  var Base = S.require("base");

  var BaseChart = Base.extend({
    // 添加widget
    plug:function(){},
    // 移除widget
    unplug:function(){},
    //==================== 基础方法 start ====================
    test:function(){}
    //==================== 基础方法 end ====================
  });

  return BaseChart;
});
