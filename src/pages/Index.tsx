import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, AlertCircle, CheckCircle2 } from "lucide-react";
import { EstimateResponse } from "@shared/api";

export default function Index() {
  const [dishName, setDishName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<EstimateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishName.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/estimate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ dish: dishName.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to estimate carbon footprint");
      }

      const data: EstimateResponse = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Please select an image file");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);

      const response = await fetch("/api/estimate/image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        console.error(`Upload failed: ${response.status} ${response.statusText}`);

        let errorMessage = `Server error: ${response.status}`;
        try {
          const responseClone = response.clone();
          const responseText = await responseClone.text();
          console.error('Response body:', responseText);

          try {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.error || errorMessage;
          } catch {

            errorMessage = responseText.substring(0, 100) || errorMessage;
          }
        } catch (readError) {
          console.error('Failed to read response:', readError);
        }

        throw new Error(errorMessage);
      }

      const data: EstimateResponse = await response.json();
      setResult(data);
    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "An error occurred while uploading");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {

      if (!file.type.startsWith('image/')) {
        setError("Please select an image file");
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }
      
      setError(null);
      setSelectedFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        if (file.size <= 5 * 1024 * 1024) {
          setSelectedFile(file);
          setError(null);
        } else {
          setError("File size must be less than 5MB");
        }
      } else {
        setError("Please select an image file");
      }
    }
  };

  const getCarbonLevel = (carbonKg: number) => {
    if (carbonKg < 2) return { label: "Low Impact", color: "bg-green-500", textColor: "text-green-700" };
    if (carbonKg < 5) return { label: "Medium Impact", color: "bg-yellow-500", textColor: "text-yellow-700" };
    return { label: "High Impact", color: "bg-red-500", textColor: "text-red-700" };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4">
      <main className="container mx-auto py-8">
        {/* Input Section */}
        <div className="max-w-4xl mx-auto mb-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-center text-2xl">Estimate Carbon Footprint</CardTitle>
              <CardDescription className="text-center">
                Choose your preferred method to analyze your dish
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="text" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="text" className="flex items-center space-x-2">
                    <span>Enter Dish Name</span>
                  </TabsTrigger>
                  <TabsTrigger value="image" className="flex items-center space-x-2">
                    Upload Photo
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="text" className="mt-6">
                  <form onSubmit={handleTextSubmit} className="space-y-4">
                    <div>
                      <Input
                        type="text"
                        placeholder="e.g., Chicken Biryani, Caesar Salad, Beef Burger..."
                        value={dishName}
                        onChange={(e) => setDishName(e.target.value)}
                        className="text-lg py-6"
                        disabled={isLoading}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      disabled={!dishName.trim() || isLoading}
                      className="w-full py-6 text-lg"
                    >
                      {isLoading ? "Analyzing..." : "Estimate Carbon Footprint"}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="image" className="mt-6">
                  <form onSubmit={handleImageSubmit} className="space-y-4">
                    <div className="space-y-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading}
                        className="w-full py-6 text-lg"
                      >
                        {selectedFile ? "Change Photo" : "Select Photo"}
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        disabled={isLoading}
                      />
                      {selectedFile && (
                        <div className="mt-4 p-3 bg-green-50 rounded-md">
                          <p className="text-green-700">
                            Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(1)} MB)
                          </p>
                        </div>
                      )}
                    </div>
                    <Button
                      type="submit"
                      disabled={!selectedFile || isLoading}
                      className="w-full py-6 text-lg"
                    >
                      {isLoading ? "Analyzing Image..." : "Analyze Photo"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Error Display */}
        {error && (
          <div className="max-w-4xl mx-auto mb-8">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2 text-red-700">
                  <AlertCircle className="h-5 w-5" />
                  <p>{error}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {result && (
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">Carbon Footprint Analysis</CardTitle>
                <CardDescription>Here's the environmental impact of your dish</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                  <h3 className="text-3xl font-bold text-green-900 mb-2">{result.dish}</h3>
                  <div className="flex items-center justify-center space-x-4">
                    <div className="text-4xl font-bold text-green-600">
                      {result.estimated_carbon_kg} kg CO₂
                    </div>
                  </div>
                  <p className="text-green-700 mt-2">Estimated carbon emissions</p>
                </div>

                <div>
                  <h4 className="text-xl font-semibold text-green-900 mb-4">Ingredient Breakdown</h4>
                  <div className="grid gap-3">
                    {result.ingredients.map((ingredient, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-4 bg-white border border-green-200 rounded-lg"
                      >
                        <span className="font-medium text-green-900">{ingredient.name}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-green-600 font-semibold">
                            {ingredient.carbon_kg} kg CO₂
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
