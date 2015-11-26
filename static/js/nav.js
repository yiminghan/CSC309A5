function setNavEvent(){
    $('#topNav li').click(function(e) {
        $('#topNav li.active').removeClass('active');
        var $this = $(this);
        if (!$this.hasClass('active')) {
            $this.addClass('active');
        }
        e.preventDefault();
    });
}
setNavEvent();