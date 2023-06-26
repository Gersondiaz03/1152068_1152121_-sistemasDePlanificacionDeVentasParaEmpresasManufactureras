document.addEventListener('DOMContentLoaded', () => {
      const addProductButton = document.getElementById('addProductButton');
      const combineProductsButton = document.getElementById('combineProductsButton');
      const printHistoryButton = document.getElementById('printHistoryButton');
      const productNameInput = document.getElementById('productName');
      const productQuantityInput = document.getElementById('productQuantity');
      const productPriceInput = document.getElementById('productPrice');
      const combinedProductNameInput = document.getElementById('combinedProductName');
      const combinedProductQuantityInput = document.getElementById('combinedProductQuantity');
      const selectedProductsContainer = document.getElementById('selectedProducts');
      const soldProductsContainer = document.getElementById('soldProducts');
      const productListContainer = document.getElementById('productList');

      // Obtener historial de productos combinados desde el almacenamiento local
      let soldProducts = JSON.parse(localStorage.getItem('soldProducts')) || [];

      // Lista de productos
      let products = [];

      // Función para agregar un producto
      function addProduct() {
        const name = productNameInput.value.trim();
        const quantity = parseInt(productQuantityInput.value.trim());
        const price = parseFloat(productPriceInput.value.trim());

        if (name && quantity && price) {
          const product = {
            name,
            quantity: quantity / 1000, // Convertir la cantidad a gramos
            price: price / 1000, // Convertir el precio a precio por gramo
            remainingQuantity: quantity / 1000 // Inicialmente, la cantidad restante es igual a la cantidad total
          };

          products.push(product);

          const productItem = document.createElement('div');
          productItem.textContent = `${name} (Cantidad: ${quantity}g) - Precio: $${price.toFixed(2)}/g`;
          selectedProductsContainer.appendChild(productItem);

          renderProductList();

          productNameInput.value = '';
          productQuantityInput.value = '';
          productPriceInput.value = '';
        }
      }

      // Función para combinar productos seleccionados
      function combineProducts() {
        const combinedName = combinedProductNameInput.value.trim();
        const combinedQuantity = parseInt(combinedProductQuantityInput.value.trim());

        if (combinedName && combinedQuantity && products.length > 0) {
          const combinedProducts = [...products];
          const combinedProduct = {
            name: combinedName,
            quantity: combinedQuantity,
            products: combinedProducts
          };

          // Verificar que la cantidad del producto combinado no supere la cantidad disponible en cada producto seleccionado
          let validCombination = true;
          combinedProducts.forEach((product) => {
            if (product.remainingQuantity < product.quantity) {
              validCombination = false;
            }
          });

          if (validCombination) {
            // Actualizar la cantidad restante de cada producto seleccionado
            combinedProducts.forEach((product) => {
              product.remainingQuantity -= product.quantity;
            });

            soldProducts.push(combinedProduct);
            localStorage.setItem('soldProducts', JSON.stringify(soldProducts));

            combinedProductNameInput.value = '';
            combinedProductQuantityInput.value = '';

            selectedProductsContainer.innerHTML = '';

            products = products.filter((product) => product.remainingQuantity > 0); // Eliminar los productos seleccionados que se hayan agotado

            renderSoldProducts();
            renderProductList();
          } else {
            alert('La cantidad del producto combinado no puede superar la cantidad disponible en los productos seleccionados.');
          }
        }
      }

      // Función para renderizar el historial de productos combinados
      function renderSoldProducts() {
        soldProductsContainer.innerHTML = '';

        soldProducts.forEach((combinedProduct, index) => {
          const productItem = document.createElement('div');
          const combinedTotal = calculateTotal(combinedProduct);
          productItem.textContent = `Producto Combinado ${index + 1}: ${combinedProduct.name} (Cantidad: ${combinedProduct.quantity}) - Precio Total: $${combinedTotal.toFixed(2)}`;
          soldProductsContainer.appendChild(productItem);
        });
      }

      // Función para calcular el total del producto combinado
      function calculateTotal(combinedProduct) {
        let total = 0;

        combinedProduct.products.forEach((product) => {
          const productTotal = product.quantity * product.price;
          total += productTotal;
        });

        const combinedTotal = total * combinedProduct.quantity; // Multiplicar por la cantidad del producto combinado

        return combinedTotal;
      }

      // Función para imprimir el historial en PDF
      function printHistory() {
        const doc = new jsPDF();

        doc.setFontSize(20);
        doc.text('Listado de Productos:', 10, 10);

        let yPos = 30;

        soldProducts.forEach((combinedProduct, index) => {
          doc.setFontSize(14);
          doc.setFontStyle('bold');
          doc.text(`Producto Combinado ${index + 1}: ${combinedProduct.name} (Cantidad: ${combinedProduct.quantity})`, 10, yPos);
          yPos += 10;

          doc.setFontSize(12);
          doc.setFontStyle('normal');
          doc.text('Composición:', 10, yPos);
          yPos += 5;

          combinedProduct.products.forEach((product, productIndex) => {
            doc.text(`- ${product.name} (Cantidad: ${product.quantity.toFixed(2)}g) - Precio: $${(product.price * 1000).toFixed(2)}/g`, 15, yPos);
            yPos += 5;
          });

          const combinedTotal = calculateTotal(combinedProduct);

          doc.text(`Total del Producto Combinado: $${combinedTotal.toFixed(2)}`, 10, yPos);
          yPos += 10;

          doc.line(10, yPos, 200, yPos);
          yPos += 10;
        });

        doc.save('historial.pdf');
      }

      // Función para mostrar la disponibilidad de cada producto seleccionado
      function renderAvailableProducts() {
        const availableProductsContainer = document.getElementById('availableProducts');
        availableProductsContainer.innerHTML = '';

        products.forEach((product) => {
          const productItem = document.createElement('div');
          productItem.textContent = `${product.name} - Disponible: ${product.remainingQuantity.toFixed(2)}g`;
          availableProductsContainer.appendChild(productItem);
        });
      }

      // Función para renderizar la lista de productos
      function renderProductList() {
        productListContainer.innerHTML = '';

        products.forEach((product) => {
          const productItem = document.createElement('div');
          productItem.textContent = `${product.name} - Cantidad: ${product.quantity.toFixed(2)}g - Precio: $${(product.price * 1000).toFixed(2)}/g`;
          productListContainer.appendChild(productItem);
        });
      }

      // Agregar event listener al botón de agregar producto
      addProductButton.addEventListener('click', addProduct);

      // Agregar event listener al botón de combinar productos
      combineProductsButton.addEventListener('click', combineProducts);

      // Agregar event listener al botón de imprimir historial
      printHistoryButton.addEventListener('click', printHistory);

      // Renderizar la disponibilidad de los productos seleccionados inicialmente
      renderAvailableProducts();

      // Renderizar el historial de productos combinados
      renderSoldProducts();
    });
