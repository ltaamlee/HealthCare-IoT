document.addEventListener("DOMContentLoaded", function () {
    const input = document.getElementById("search-patient");
    const noResultRow = document.getElementById("no-result");
    const patientBody = document.getElementById("patient-table-body");
  
    input.addEventListener("keyup", function () {
      const filter = input.value.toLowerCase();
      const rows = patientBody.getElementsByTagName("tr");
  
      let found = false;
  
      for (let i = 0; i < rows.length; i++) {
        const id = rows[i].getElementsByTagName("td")[1]?.textContent.toLowerCase();
        const name = rows[i].getElementsByTagName("td")[2]?.textContent.toLowerCase();
  
        if (id.includes(filter) || name.includes(filter)) {
          rows[i].style.display = "";
          found = true;
        } else {
          rows[i].style.display = "none";
        }
      }
  
      noResultRow.style.display = found ? "none" : "";
    });
  });
  