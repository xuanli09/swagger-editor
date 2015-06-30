'use strict';

describe('Service: FoldStateManager', function () {

  // load the service's module
  beforeEach(window.angular.mock.module('SwaggerEditor'));

  // instantiate service
  var FoldStateManager;
  beforeEach(inject(function (_FoldStateManager_) {
    FoldStateManager = _FoldStateManager_;
  }));

  describe('defaults', function () {
    it('set default fold status to unfolded for ["info"]', function () {
      expect(FoldStateManager.isFolded(['info'])).to.equal(false);
    });
  });

  describe('#fold, #isFolded and #unfold', function () {
    it('folds ["info"]', function () {
      FoldStateManager.fold(['info']);

      expect(FoldStateManager.isFolded(['info'])).to.equal(true);
    });

    it('adds a path by checking if it is folded', function () {
      FoldStateManager.isFolded(['paths', '/foo']);

      expect(FoldStateManager.isFolded(['paths', '/foo'])).to.equal(false);
    });

    it('folds all paths', function () {
      FoldStateManager.fold(['paths', '*']);

      expect(FoldStateManager.isFolded(['paths', '*'])).to.equal(true);
    });

    it('unfolds all paths', function () {
      FoldStateManager.unfold(['paths', '*']);

      expect(FoldStateManager.isFolded(['paths', '*'])).to.equal(false);
    });
  });
});
