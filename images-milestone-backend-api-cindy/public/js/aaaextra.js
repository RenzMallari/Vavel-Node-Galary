 $(document).ready(function() {
            $('.teststep2').hide();
            setTimeout(function() {
                $('#footer').show();
            }, 3000);
        });

        function gotonext() {

            $('.step2').show();
            $('.step1').hide();
            $('.teststep2').show();
            $('.teststep1').hide();
        }

        function gotoprevious() {
            $('.step1').show();
            $('.step2').hide();
            $('.teststep1').show();
            $('.teststep2').hide();
        }

        function gotosubmit() {

            $('#inputfilesingle').click();
        }

        function reset_upload() {
            $('#myModal-fileupload').modal('show');
            $('.step1').show();
            $('.step2').hide();
            $('.status').text('');
            $('.teststep1').show();
            $('#editoriallicense').val('');
            $('#commerciallicense').val('');
            $('#albumaddress').val('');
            $('.teststep2').hide();

        }

        $(document).ready(function() {
            setTimeout(function() {
                $('#usernamespan').show();
                $('#footrdiv').show();
                $('#joinbuttonlink').show();
                $('#signinbuttonlink').show();
                $('#carotlink').show();
            }, 2000);
        });

        function selectmenu(id) {
            $('.ember-view').removeClass('active');
            $('#' + id).addClass('active');
        }

        function openclose(open_p, close_p) {
            $('#' + open_p).modal('toggle');
            $('#' + close_p).modal('toggle');
        }
        $('body').click(function(evt) {
            //For descendants of menu_content being clicked, remove this check if you do not want to put constraint on descendants.
            if ($(evt.target).closest('#loadsearch').length) {
                return;
            } else {
                $('#loadsearch').hide();
            }
        });