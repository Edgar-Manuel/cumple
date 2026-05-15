-- Para insertar recomendaciones, reemplaza YOUR_USER_ID con el ID obtenido de la página de perfil
INSERT INTO public.gift_recommendations 
(id, user_id, event_id, contact_id, title, description, price, image_url, affiliate_link, category, relevance, created_at, product_id)
VALUES
('g006', 'YOUR_USER_ID', 'e003', 'c003', 'Máquina para hacer pasta Philips', 'Perfecta para David que está aprendiendo a hacer pasta casera. Esta máquina automática le facilitará el proceso.', 199.99, 'https://m.media-amazon.com/images/I/71FbF1J8MkL._AC_SL1500_.jpg', 'https://www.amazon.es/dp/B0779FKT38?tag=cumple-21', 'cooking', 95, '2023-02-20T09:30:00Z', 'p010');

-- Para insertar múltiples recomendaciones a la vez:
/*
INSERT INTO public.gift_recommendations 
(id, user_id, event_id, contact_id, title, description, price, image_url, affiliate_link, category, relevance, created_at, product_id)
VALUES
('g007', 'YOUR_USER_ID', 'e004', 'c002', 'Set de Cuchillos Profesionales', 'Un set completo de cuchillos profesionales para la cocina, perfecto para Lucía que está empezando a cocinar.', 89.99, 'https://m.media-amazon.com/images/I/71JyFzKZBTL._AC_SL1500_.jpg', 'https://www.amazon.es/dp/B07D8K8FP9?tag=cumple-21', 'cooking', 90, '2023-03-15T14:00:00Z', 'p011'),
('g008', 'YOUR_USER_ID', 'e005', 'c001', 'Set de Jardinería Completo', 'Incluye todas las herramientas necesarias para empezar con la jardinería. Ideal para Ana que acaba de conseguir terraza.', 45.50, 'https://m.media-amazon.com/images/I/81TdKicXbfL._AC_SL1500_.jpg', 'https://www.amazon.es/dp/B08NPKZRQT?tag=cumple-21', 'gardening', 85, '2023-04-10T11:15:00Z', 'p012');
*/ 