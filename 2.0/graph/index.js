/**
 * overview 所有图表入口
 * */
KISSY.add("gallery/kcharts/2.0/graph/index",function(S,Base,D,E,Raphael){

  var Graph = Base.extend({
    initializer:function(){
      var con = D.get(
        this.get("renderTo")
      );
      if(!con){
        throw Error("未找到容器");
      }
      this.set("paper",con);

      var w = D.width(con);
      var h = D.height(con);
      var paper = Raphael(con,w,h);
      this.set("paper",paper);
      this.set("containerWidth",w);
      this.set("containerHeight",h);

      var pd = this.getPadding();

      this.set("width",w - pd.paddingLeft - pd.paddingRight);
      this.set("height",h - pd.paddingTop - pd.paddingBottom);
    },
    // 添加子图
    add:function(chart){
      if(chart){
        // 设置graph容器
        chart.set({
          graph:this
        });
        chart.render();
      }
    },
    // 移除子图
    remove:function(chart){
      // 销毁chart
      chart && chart.destroy(this);
    },
    //==================== 基础方法start ====================
    getPadding:function(){
      return {
        paddingTop:5,
        paddingRight:5,
        paddingBottom:5,
        paddingLeft:5
      }
    },
    getBBox:function(){
      var pd = this.getPadding();

      var w = this.get("containerWidth") - pd.paddingLeft - pd.paddingRight;
      var h = this.get("containerHeight") - pd.paddingTop - pd.paddingBottom;
      return {
        width:w,
        height:h,
        left:pd.paddingLeft,
        top:pd.paddingTop
      }
    }
    //==================== 基础方法 end ====================
  });

  return Graph;
},{
  requires:[
    "base",
    "dom",
    "event",
    "gallery/kcharts/2.0/raphael/index"
  ]
});
