import pandas as pd
import numpy as np

def create_mock_dataset():
    """Generates and saves a mock dataset simulating sensor readings."""
    num_features = 100 
    wavelengths = [f'wave_{i}' for i in range(num_features)]
    plastic_types = ['PET', 'HDPE', 'PVC', 'PE']
    data = []

    print("Generating mock sensor data...")
    for p_type in plastic_types:
        for _ in range(200):
            # Create a baseline "fingerprint" with random noise
            baseline = np.random.rand(num_features) * 0.5
            # Add specific peaks to simulate different plastic types
            if p_type == 'PET':
                baseline[10:20] += np.random.rand(10) * 1.5
            elif p_type == 'HDPE':
                baseline[40:50] += np.random.rand(10) * 1.2
            elif p_type == 'PVC':
                baseline[70:80] += np.random.rand(10) * 1.8
            
            row = dict(zip(wavelengths, baseline))
            row['plastic_type'] = p_type
            data.append(row)

    df = pd.DataFrame(data)
    df.to_csv('mock_sensor_data.csv', index=False)
    print("Successfully created 'mock_sensor_data.csv'")

if __name__ == '__main__':
    create_mock_dataset()