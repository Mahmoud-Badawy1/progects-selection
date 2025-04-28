document.addEventListener('DOMContentLoaded', async function () {
  const selectElement = document.getElementById('option');
  
  try {
    const response = await fetch('/reserved-options');
    const reservedOptions = await response.json();

    Array.from(selectElement.options).forEach(option => {
      if (reservedOptions.includes(option.value)) {
        option.remove();
      }
    });
  } catch (error) {
    console.error('Error fetching reserved options:', error);
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
        const selectedOption = form.option.options[form.option.selectedIndex];
        if (selectedOption) {
          selectedOption.remove();
        }
        form.reset();
      } else {
        const errorMsg = await response.text();
        alert(errorMsg);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('حدث خطأ أثناء الاتصال بالسيرفر.');
    }
});

  form.addEventListener('reset', function () {
    const selectElement = document.getElementById('option');
    Array.from(selectElement.options).forEach(option => {
      option.disabled = false;
    });
  });
});
