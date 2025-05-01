document.addEventListener('DOMContentLoaded', async function () {
  const selectElement = document.getElementById('option');

  try {
    // Fetch stats per option
    const response = await fetch('/option-stats');
    const stats = await response.json();

    // Disable/remove options reserved by 2 users
    stats.forEach(item => {
      if (item.count >= 2) {
        const optionToDisable = selectElement.querySelector(`option[value="${item._id}"]`);
        if (optionToDisable) {
          optionToDisable.disabled = true;
          optionToDisable.textContent += ' (تم الحجز)';
        }
      }
    });
  } catch (error) {
    console.error('Error fetching option stats:', error);
  }

  const form = document.getElementById('registerForm');
  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    if (!/^[0-9]{11}$/.test(form.phone.value)) {
      alert('رقم الهاتف يجب أن يكون 11 رقماً.');
      return;
    }
    if (form.name.value.length < 3) {
      alert('الاسم يجب أن يكون 3 أحرف على الأقل.');
      return;
    }

    const formData = {
      name: form.name.value,
      phone: form.phone.value,
      option: form.option.value,
    };

    try {
      const response = await fetch('/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('تم التسجيل بنجاح!');
        form.reset();
        window.location.reload(); // Reload to refresh option status
      } else {
        const errorMsg = await response.text();
        alert(errorMsg);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('حدث خطأ أثناء الاتصال بالسيرفر.');
    }
  });
});
