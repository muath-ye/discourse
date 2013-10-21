module Onebox
  module Engine
    class ExampleOnebox
      include Engine
      include HTML

      matches do
        http
        maybe("www.")
        domain("example")
        has(".com").maybe("/")
      end

      private

      def data
        {
          link: link,
          domain: "http://www.example.com",
          badge: "e",
          title: raw.css("h1").inner_text
        }
      end
    end
  end
end

