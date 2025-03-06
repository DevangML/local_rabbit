import * as Comlink from 'comlink';

class Calculator {
  // Example heavy computation
  async fibonacci(n: number): Promise<number> {
    if (n <= 1) return n;
    const [a, b] = await Promise.all([
      this.fibonacci(n - 1),
      this.fibonacci(n - 2)
    ]);
    return a + b;
  }

  // Example data processing
  async processData(data: any[]): Promise<any[]> {
    return data.map(item => ({
      ...item,
      processed: true,
      timestamp: Date.now()
    }));
  }

  // Example image processing (simulated)
  async processImage(imageData: ImageData): Promise<ImageData> {
    // Simulate image processing by inverting colors
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255 - data[i];         // red
      data[i + 1] = 255 - data[i + 1]; // green
      data[i + 2] = 255 - data[i + 2]; // blue
      // alpha remains unchanged
    }
    return imageData;
  }
}

Comlink.expose(Calculator); 