$(document).ready(function() {
  $(".delete-article").on("click", function(e) {
    $target = $(e.target);
    const id = $target.attr("data-id");
    console.log(id);
    if (confirm("Are you sure you want to delete this item?")) {
      $.ajax({
        type: "DELETE",
        url: "/articles/" + id,
        success: function(response) {
          // alert("Deleting Article");
          window.location.href = "/";
        },
        error: function(err) {
          console.log(err);
        }
      });
    }
  });

  //ANSWERS
  let answer = document.getElementById("answer");
  if (answer) {
    let answerdiv = document.getElementById("answerdiv");
    answer.addEventListener("click", function(e) {
      // answer.className = "btn-disable";
      $target = $(e.target);
      const id = $target.attr("data-id");

      let input = `
      <form id='form' action="/articles/answers/${id}", method='POST'>
      <textarea class='form-control' name='answer' required></textarea> <br>
      <input class='btn btn-success' type='submit' value="Post Answer">
      <button class='btn btn-danger'id="cancel">Cancel</button>
      </form>
      
      `;

      answerdiv.innerHTML = input;
      functionForCancel();
    });
  }
  function functionForCancel() {
    let cancel = document.getElementById("cancel");
    cancel.addEventListener("click", function(e) {
      e.preventDefault();
      document.getElementById("form").style.display = "none";
    });
  }

  let like = document.querySelectorAll(".fa-thumbs-up");
  let dislike = document.querySelectorAll(".fa-thumbs-down");

  like.forEach(i => {
    i.addEventListener("click", function(e) {
      let $target = $(e.target);
      const id = $target.attr("data-id");

      let like_count = document.querySelector("#likes-count" + id);
      let store = ++like_count.textContent;
      e.target.style.color = "blue";
      event.target.nextSibling.nextSibling.style = "grey";
      event.target.nextSibling.nextSibling.classList.remove("like-disabled");
      e.target.classList.add("like-disabled");

      // fetch;
      fetch(`/articles/likes/${id}`, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        method: "POST",

        body: JSON.stringify({
          like_count: store
        })
      })
        .then(response => response.json())
        .then(response => console.log(response))
        .catch(error => console.error("Error:", error));
    });
  });

  dislike.forEach(i => {
    i.addEventListener("click", function(e) {
      let $target = $(e.target);
      const id = $target.attr("data-id");

      let dislike_count = document.querySelector("#likes-count" + id);
      console.log(dislike_count.textContent);
      if (dislike_count.textContent == 0) {
        e.target.classList.add("like-disabled");
      } else {
        let store = --dislike_count.textContent;
        e.target.style.color = "blue";
        e.target.classList.add("like-disabled");
        event.target.previousSibling.previousSibling.classList.remove(
          "like-disabled"
        );

        event.target.previousSibling.previousSibling.style = "grey";

        fetch(`/articles/likes/${id}`, {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          method: "POST",

          body: JSON.stringify({
            like_count: store
          })
        })
          .then(response => response.json())
          .then(response => console.log(response))
          .catch(error => console.error("Error:", error));
      }
    });
  });

  //remove alert
  let alert = document.querySelectorAll(".alert");
  if (alert) {
    setTimeout(function() {
      alert.forEach(i => i.remove());
    }, 3000);
  }
});
