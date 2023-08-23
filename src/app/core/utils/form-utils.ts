export function transformFormData(formData: any): any {
  const transformedData = { ...formData };

  for (const key in transformedData) {
    if (transformedData.hasOwnProperty(key) && transformedData[key] === '') {
      transformedData[key] = null;
    }
  }

  return transformedData;
}
