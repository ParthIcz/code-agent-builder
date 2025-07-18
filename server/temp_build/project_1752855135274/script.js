const button = document.getElementById('myButton');

button.addEventListener('click', () => {
  try {
    //Simulate an API call with a loading state
    button.textContent = 'Loading...';
    button.disabled = true;
    setTimeout(() => {
      button.textContent = 'Clicked!';
      button.disabled = false;
      alert('Button Clicked!');
    }, 1500);
  } catch (error) {
    console.error('Error:', error);
    button.textContent = 'Error!';
    button.disabled = false;
    alert('An error occurred!');
  }
});