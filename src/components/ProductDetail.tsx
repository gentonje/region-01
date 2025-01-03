import { ArrowLeft, MessageSquare, Send, Star, Trash } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "./ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Product {
  id: string;
  title: string;
  price: number;
  description: string;
  storage_path: string;
  currency: string;
  average_rating: number;
  category: string;
  in_stock: boolean;
  product_images: { storage_path: string; is_main: boolean }[];
}

interface ProductDetailProps {
  product: Product;
  getProductImageUrl: (product: Product) => string;
  onBack: () => void;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  user_id: string;
  profiles: {
    full_name: string;
    avatar_url: string;
  };
  review_replies: {
    id: string;
    content: string;
    created_at: string;
    user_id: string;
    profiles: {
      full_name: string;
      avatar_url: string;
    };
  }[];
}

const StarRating = ({ rating, onSelect }: { rating: number; onSelect?: (rating: number) => void }) => {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={16}
          className={`${
            star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
          } ${onSelect ? "cursor-pointer" : ""}`}
          onClick={() => onSelect?.(star)}
        />
      ))}
    </div>
  );
};

const ProductDetail = ({ product, getProductImageUrl, onBack }: ProductDetailProps) => {
  const [selectedImage, setSelectedImage] = useState<string>(
    product.product_images.find(img => !img.is_main)?.storage_path || product.product_images[0]?.storage_path
  );
  const [newReview, setNewReview] = useState("");
  const [selectedRating, setSelectedRating] = useState(5);
  const [replyContent, setReplyContent] = useState<{ [key: string]: string }>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reviews, isLoading: isLoadingReviews } = useQuery({
    queryKey: ['reviews', product.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles (full_name, avatar_url),
          review_replies (
            id,
            content,
            created_at,
            user_id,
            profiles (full_name, avatar_url)
          )
        `)
        .eq('product_id', product.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Review[];
    }
  });

  const addReviewMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Must be logged in to review");

      const { error } = await supabase
        .from('reviews')
        .insert({
          product_id: product.id,
          rating: selectedRating,
          comment: newReview,
          user_id: user.id
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', product.id] });
      setNewReview("");
      setSelectedRating(5);
      toast({
        title: "Review added",
        description: "Your review has been posted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const addReplyMutation = useMutation({
    mutationFn: async ({ reviewId, content }: { reviewId: string; content: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Must be logged in to reply");

      const { error } = await supabase
        .from('review_replies')
        .insert({
          review_id: reviewId,
          content,
          user_id: user.id
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', product.id] });
      setReplyContent({});
      toast({
        title: "Reply added",
        description: "Your reply has been posted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    addReviewMutation.mutate();
  };

  const handleSubmitReply = async (reviewId: string) => {
    const content = replyContent[reviewId];
    if (!content?.trim()) return;
    
    addReplyMutation.mutate({ reviewId, content });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="space-y-1">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle className="text-2xl">{product.title}</CardTitle>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{product.category}</span>
          <StarRating rating={product.average_rating || 0} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="aspect-video relative rounded-lg overflow-hidden">
            <img
              src={supabase.storage.from('images').getPublicUrl(selectedImage).data.publicUrl}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {product.product_images.map((image, index) => (
              <div
                key={index}
                className={`w-20 h-20 rounded-md overflow-hidden cursor-pointer ${
                  selectedImage === image.storage_path ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedImage(image.storage_path)}
              >
                <img
                  src={supabase.storage.from('images').getPublicUrl(image.storage_path).data.publicUrl}
                  alt={`${product.title} ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
        
        <ScrollArea className="h-[200px] rounded-md border p-4">
          <p className="text-sm text-muted-foreground">{product.description}</p>
        </ScrollArea>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Reviews</h3>
          
          <form onSubmit={handleSubmitReview} className="space-y-2">
            <div className="flex items-center gap-2">
              <StarRating rating={selectedRating} onSelect={setSelectedRating} />
              <span className="text-sm text-muted-foreground">Select rating</span>
            </div>
            <Textarea
              placeholder="Write your review..."
              value={newReview}
              onChange={(e) => setNewReview(e.target.value)}
            />
            <Button type="submit" disabled={addReviewMutation.isPending}>
              Post Review
            </Button>
          </form>

          <ScrollArea className="h-[300px] rounded-md border p-4">
            {isLoadingReviews ? (
              <div>Loading reviews...</div>
            ) : (
              <div className="space-y-4">
                {reviews?.map((review) => (
                  <div key={review.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold">{review.profiles.full_name}</div>
                        <StarRating rating={review.rating} />
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <p className="text-sm">{review.comment}</p>

                    {/* Replies */}
                    <div className="ml-6 space-y-2">
                      {review.review_replies?.map((reply) => (
                        <div key={reply.id} className="border-l-2 pl-4 py-2">
                          <div className="flex items-center justify-between">
                            <div className="font-medium text-sm">{reply.profiles.full_name}</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(reply.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          <p className="text-sm">{reply.content}</p>
                        </div>
                      ))}

                      {/* Reply input */}
                      <div className="flex gap-2">
                        <Textarea
                          placeholder="Write a reply..."
                          value={replyContent[review.id] || ''}
                          onChange={(e) => setReplyContent(prev => ({
                            ...prev,
                            [review.id]: e.target.value
                          }))}
                          className="text-sm"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleSubmitReply(review.id)}
                          disabled={addReplyMutation.isPending}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div>
          <p className="text-2xl font-bold text-vivo-orange">
            {product.currency} {product.price?.toFixed(2)}
          </p>
          <span className={`text-sm px-2 py-1 rounded-full ${
            product.in_stock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {product.in_stock ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>
        <Button>Add to Cart</Button>
      </CardFooter>
    </Card>
  );
};

export default ProductDetail;