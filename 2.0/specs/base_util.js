describe('BaseUtil', function(){
  describe('#formatSeriesData()', function(){
    it('should format series', function(done){
      KISSY.use("gallery/kcharts/2.0/base/util",function(S,BaseUtil){
        var result;

        // 最简单的格式
        result = BaseUtil.formatSeriesData([1,2,3]);
        expect(JSON.stringify(result)).to.equal('[{"data":[{"yval":1},{"yval":2},{"yval":3}]}]');

        result = BaseUtil.formatSeriesData([{yval:2},{yval:3}]);
        expect(JSON.stringify(result)).to.equal('[{"data":[{"yval":2},{"yval":3}]}]');

        result = BaseUtil.formatSeriesData([{name:"Group1",data:[{yval:2,xval:"周一"},{yval:3,xval:"周二"}]}]);
        expect(JSON.stringify(result)).to.equal('[{"name":"Group1","data":[{"yval":2,"xval":"周一"},{"yval":3,"xval":"周二"}]}]');

        // console.log(JSON.stringify(result));
        done();
      });
    })
  })
  describe('#textSeriesToNumberSeries()', function(){
    it('should convert text to number', function(done){
      KISSY.use("gallery/kcharts/2.0/base/util",function(S,BaseUtil){
        var result;
        result = BaseUtil.textSeriesToNumberSeries([{xval:"星期一",yval:3},{xval:"星期二",yval:3}]);
        expect(JSON.stringify(result)).to.equal('[{"xval":0,"yval":3,"xstring":"星期一"},{"xval":1,"yval":3,"xstring":"星期二"}]');

        result = BaseUtil.textSeriesToNumberSeries([{"yval":1},{"yval":2},{"yval":3}]);
        expect(result).to.equal('[{"yval":1,"xval":0},{"yval":2,"xval":1},{"yval":3,"xval":2}]');

        result = BaseUtil.convertSeriesToPoints();
        console.log(JSON.stringify(result));
        done();
      });
    });
  });
})
