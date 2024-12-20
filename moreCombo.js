$i = 0;
$("#btn").click(function () {
    $i++;
    if ($i >= 20) {
        $("#btn").hide();
        alert("答案已经在你心里了，你不该如此纠结！");
    }
});
