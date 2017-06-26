'use strict';

(function () {
  window.navGlobal = function (reference) {
    if (window.appComponentRef) {
      window.appComponentRef.zone.run(function () {
        window.appComponentRef.comp.navigate(reference);
      });
    }
  }
})();
