'use strict';

describe('Service: FoldStateManager', function () {

  // load the service's module
  beforeEach(window.angular.mock.module('SwaggerEditor'));

  // instantiate service
  var FoldStateManager;
  beforeEach(inject(function (_FoldStateManager_) {
    FoldStateManager = _FoldStateManager_;
    window.localStorage.clear();
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

    it('unfolds ["info"]', function () {
      FoldStateManager.unfold(['info']);

      expect(FoldStateManager.isFolded(['info'])).to.equal(false);
    });

    it('unfolds ["info"]', function () {
      FoldStateManager.toggleFold(['info']);

      expect(FoldStateManager.isFolded(['info'])).to.equal(true);
    });

    it('adds a path by checking if it is folded', function () {
      // Add new paths
      FoldStateManager.isFolded(['paths', '/foo']);
      FoldStateManager.isFolded(['paths', '/bar']);
      FoldStateManager.isFolded(['paths', '/baz']);

      expect(FoldStateManager.isFolded(['paths', '/foo'])).to.equal(false);
      expect(FoldStateManager.isFolded(['paths', '/bar'])).to.equal(false);
      expect(FoldStateManager.isFolded(['paths', '/baz'])).to.equal(false);
    });

    it('folds all paths', function () {
      // Add new paths
      FoldStateManager.isFolded(['paths', '/foo']);
      FoldStateManager.isFolded(['paths', '/bar']);
      FoldStateManager.isFolded(['paths', '/baz']);

      FoldStateManager.fold(['paths', /./]);

      expect(FoldStateManager.isFolded(['paths', /./])).to.equal(true);
    });

    it('unfolds all paths', function () {
      // Add new paths
      FoldStateManager.isFolded(['paths', '/foo']);
      FoldStateManager.isFolded(['paths', '/bar']);
      FoldStateManager.isFolded(['paths', '/baz']);

      FoldStateManager.unfold(['paths', /./]);

      expect(FoldStateManager.isFolded(['paths', /./])).to.equal(false);
    });

    it('toggle folds all paths', function () {
      // Add new paths
      FoldStateManager.isFolded(['paths', '/foo']);
      FoldStateManager.isFolded(['paths', '/bar']);
      FoldStateManager.isFolded(['paths', '/baz']);

      FoldStateManager.toggleFold(['paths', /./]);

      expect(FoldStateManager.isFolded(['paths', '/bar'])).to.equal(true);
      expect(FoldStateManager.isFolded(['paths', /./])).to.equal(true);
    });
  });
});
