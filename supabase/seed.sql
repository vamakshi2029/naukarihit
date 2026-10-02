-- OPTIONAL: sample drives so your demo looks alive. Run after schema.sql.
insert into public.drives (company, role, description, package_lpa, location, min_cgpa, branches, deadline) values
('TCS', 'Software Engineer', 'Entry-level development role. Online aptitude test followed by technical and HR interviews.', 7.0, 'Pune', 6.0, '{}', now() + interval '12 days'),
('Infosys', 'Systems Engineer', 'Join the digital delivery team. Training provided in Mysuru.', 6.5, 'Bengaluru', 6.5, '{CSE,CSBS,IT}', now() + interval '9 days'),
('Zoho', 'Member Technical Staff', 'Product development. Programming round, then problem-solving interviews.', 10.0, 'Chennai', 7.5, '{CSE,CSBS,IT}', now() + interval '20 days'),
('Persistent Systems', 'Associate Software Engineer', 'Product engineering across cloud and data teams.', 8.0, 'Pune', 7.0, '{CSE,CSBS,IT,AI&DS}', now() + interval '6 days'),
('Accenture', 'Associate Software Engineer', 'Application development and cloud migration projects.', 4.6, 'Mumbai', 6.0, '{}', now() + interval '3 days'),
('Capgemini', 'Analyst', 'Technology consulting with a rotation across client projects.', 4.0, 'Pune', 6.0, '{}', now() - interval '2 days');
