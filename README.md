---

LƯU Ý: server thuê docker setup root/index.js không setup chỗ khác nhờ package.json

controllers: Nơi tiếp nhận request từ router, điều phối logic và trả về response cho client.

services: (Rất quan trọng) Nơi chứa logic nghiệp vụ chính. Controller sẽ gọi Service để xử lý dữ liệu thay vì viết logic trực tiếp trong Controller.

routes: Định nghĩa các endpoint (đường dẫn API) và gắn chúng với các controller tương ứng.

middlewares: Nơi chứa các hàm trung gian xử lý Auth (JWT), check quyền (Role), hoặc log dữ liệu trước khi vào Controller.

exceptions: Thư mục này rất hay, dùng để định nghĩa các lớp lỗi tùy chỉnh (Custom Error), giúp việc xử lý lỗi tập trung và chuyên nghiệp hơn.
-- custom lỗi : rồi vứt đâu thì vứt --

generated: Nơi chứa prisma-client. Việc bạn để output của Prisma vào đây là cách làm sạch sẽ, giúp tách biệt code do máy tạo ra và code bạn viết tay.

utils: Chứa các hàm dùng chung (helper) như format ngày tháng, mã hóa mật khẩu, v.v.