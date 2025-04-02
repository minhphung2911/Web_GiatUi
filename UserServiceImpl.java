package com.example.webgiatui.service.impl;

import com.example.webgiatui.dto.UserDto;
import com.example.webgiatui.entity.Role;
import com.example.webgiatui.entity.User;
import com.example.webgiatui.repository.RoleRepository;
import com.example.webgiatui.repository.UserRepository;
import com.example.webgiatui.service.UserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    private UserRepository userRepository;
    private RoleRepository roleRepository;
    private PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository,
                           RoleRepository roleRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void saveUser(UserDto userDto) {
        User user = new User();
        user.setName(userDto.getFirstName() + " " + userDto.getLastName());
        user.setEmail(userDto.getEmail());

        //encrypt the password once we integrate spring security
        //user.setPassword(userDto.getPassword());
        user.setPassword(passwordEncoder.encode(userDto.getPassword()));
        Role role = roleRepository.findByName("ROLE_ADMIN");
        if(role == null){
            role = checkRoleExist();
        }
        user.setRoles(Arrays.asList(role));
        userRepository.save(user);
    }

    @Override
    public User findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public List<UserDto> findAllUsers() {
        List<User> users = userRepository.findAll();
        return users.stream().map((user) -> convertEntityToDto(user))
                .collect(Collectors.toList());
    }

    private UserDto convertEntityToDto(User user){
        UserDto userDto = new UserDto();
        String[] name = user.getName().split(" ");
        userDto.setFirstName(name[0]);
        userDto.setLastName(name[1]);
        userDto.setEmail(user.getEmail());
        return userDto;
    }

    private Role checkRoleExist() {
        Role role = new Role();
        role.setName("ROLE_ADMIN");
        return roleRepository.save(role);
    }
}
@SpringBootApplication
public class LaundryServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(LaundryServiceApplication.class, args);
    }
}
// Customer Management
@RestController
@RequestMapping("/customers")
class CustomerController {
    @Autowired
    private CustomerService customerService;

    @GetMapping
    public List<Customer> getAllCustomers() {
        return customerService.getAllCustomers();
    }

    @PostMapping
    public Customer addCustomer(@RequestBody Customer customer) {
        return customerService.addCustomer(customer);
    }
}

@Service
class CustomerService {
    private List<Customer> customers = new ArrayList<>();

    public List<Customer> getAllCustomers() {
        return customers;
    }

    public Customer addCustomer(Customer customer) {
        customers.add(customer);
        return customer;
    }
}

class Customer {
    private String name;
    private String phone;

    public Customer() {}

    public Customer(String name, String phone) {
        this.name = name;
        this.phone = phone;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }
}

// Laundry Order Management
@RestController
@RequestMapping("/orders")
class OrderController {
    @Autowired
    private OrderService orderService;

    @GetMapping
    public List<LaundryOrder> getAllOrders() {
        return orderService.getAllOrders();
    }

    @PostMapping
    public LaundryOrder createOrder(@RequestBody LaundryOrder order) {
        return orderService.createOrder(order);
    }

    @PutMapping("/{id}/status")
    public LaundryOrder updateOrderStatus(@PathVariable int id, @RequestParam String status) {
        return orderService.updateOrderStatus(id, status);
    }
}

@Service
class OrderService {
    private List<LaundryOrder> orders = new ArrayList<>();
    private int orderCounter = 1;

    public List<LaundryOrder> getAllOrders() {
        return orders;
    }

    public LaundryOrder createOrder(LaundryOrder order) {
        order.setId(orderCounter++);
        orders.add(order);
        return order;
    }

    public LaundryOrder updateOrderStatus(int id, String status) {
        for (LaundryOrder order : orders) {
            if (order.getId() == id) {
                order.setStatus(status);
                return order;
            }
        }
        return null;
    }
}

class LaundryOrder {
    private int id;

    private String customerName;
    private String serviceType;
    private double price;
    private String status;

    public LaundryOrder() {}

    public LaundryOrder(String customerName, String serviceType, double price) {
        this.customerName = customerName;
        this.serviceType = serviceType;
        this.price = price;
        this.status = "Pending";
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getServiceType() {
        return serviceType;
    }

    public void setServiceType(String serviceType) {
        this.serviceType = serviceType;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}