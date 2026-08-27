// Rename the resume on download to divyansh_shukla_resume_<today>.pdf.
// The browser reads the download attribute at the moment the link is activated,
// so stamp it on load and refresh it on each interaction in case the page has
// been sitting open past midnight.
(function () {
    function downloadName() {
        var d = new Date();
        var pad = function (n) { return String(n).padStart(2, '0'); };
        return 'divyansh_shukla_resume_' +
            d.getFullYear() + '_' + pad(d.getMonth() + 1) + '_' + pad(d.getDate()) + '.pdf';
    }

    function init() {
        var links = document.querySelectorAll('a[download][href$=".pdf"]');
        if (!links.length) return;

        function stamp() {
            var name = downloadName();
            Array.prototype.forEach.call(links, function (a) {
                a.setAttribute('download', name);
            });
        }

        stamp();
        Array.prototype.forEach.call(links, function (a) {
            a.addEventListener('pointerdown', stamp);
            a.addEventListener('contextmenu', stamp);
            a.addEventListener('keydown', stamp);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
