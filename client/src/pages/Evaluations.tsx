import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle, Clock, Loader2, Eye } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getEvaluations, updateEvaluationStatus } from "@/lib/supabaseOperations";
import { Textarea } from "@/components/ui/textarea";

interface Evaluation {
  id: string;
  employee_id: string;
  user_id: string;
  is_anonymous: boolean;
  ratings: Record<string, number>;
  comment?: string;
  status: "pending" | "approved" | "rejected";
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export default function Evaluations() {
  const { isAdmin } = useAuth();
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEval, setSelectedEval] = useState<Evaluation | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    loadEvaluations();
  }, []);

  const loadEvaluations = async () => {
    try {
      setIsLoading(true);
      const result = await getEvaluations();
      setEvaluations(result.evaluations);
    } catch (error) {
      console.error("Error loading evaluations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await updateEvaluationStatus(id, "approved");
      await loadEvaluations();
    } catch (error) {
      console.error("Error approving evaluation:", error);
      alert("حدث خطأ أثناء الموافقة على التقييم");
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectionReason.trim()) {
      alert("يرجى إدخال سبب الرفض");
      return;
    }
    try {
      await updateEvaluationStatus(id, "rejected", rejectionReason);
      setRejectionReason("");
      setIsViewOpen(false);
      await loadEvaluations();
    } catch (error) {
      console.error("Error rejecting evaluation:", error);
      alert("حدث خطأ أثناء رفض التقييم");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />موافق عليه</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />مرفوض</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />قيد الانتظار</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">التقييمات</h1>
        <p className="text-gray-600 mt-2">عرض وإدارة التقييمات المرسلة</p>
      </div>

      <Card className="backdrop-blur-xl bg-white/80 border-white/30">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الموظف</TableHead>
                <TableHead>المُقيّم</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {evaluations.map((evaluation) => (
                <TableRow key={evaluation.id}>
                  <TableCell className="font-medium">—</TableCell>
                  <TableCell>{evaluation.is_anonymous ? "مجهول" : evaluation.user_id}</TableCell>
                  <TableCell>{getStatusBadge(evaluation.status)}</TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {new Date(evaluation.created_at).toLocaleDateString("ar-SA")}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedEval(evaluation);
                          setIsViewOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {isAdmin && evaluation.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleApprove(evaluation.id)}
                          >
                            موافقة
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تفاصيل التقييم</DialogTitle>
          </DialogHeader>
          {selectedEval && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">الحالة</label>
                  <p className="mt-1">{getStatusBadge(selectedEval.status)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">التاريخ</label>
                  <p className="mt-1 text-gray-600">
                    {new Date(selectedEval.created_at).toLocaleDateString("ar-SA")}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">التقييمات</label>
                <div className="mt-2 space-y-2">
                  {Object.entries(selectedEval.ratings).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-gray-600">{key}</span>
                      <span className="font-medium">{value}/5</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedEval.comment && (
                <div>
                  <label className="text-sm font-medium text-gray-700">التعليق</label>
                  <p className="mt-1 text-gray-600">{selectedEval.comment}</p>
                </div>
              )}

              {isAdmin && selectedEval.status === "pending" && (
                <div className="space-y-3 border-t pt-4">
                  <Textarea
                    placeholder="سبب الرفض (إذا كنت ستقوم برفض التقييم)"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button
                      className="bg-green-600 hover:bg-green-700 text-white flex-1"
                      onClick={() => {
                        handleApprove(selectedEval.id);
                        setIsViewOpen(false);
                      }}
                    >
                      الموافقة
                    </Button>
                    <Button
                      variant="outline"
                      className="text-red-600 hover:text-red-700 flex-1"
                      onClick={() => handleReject(selectedEval.id)}
                    >
                      الرفض
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
