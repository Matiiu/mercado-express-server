import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { CreateProductDto } from './dto/create-product.dto';
import { ProductsService } from './products.service';
import { FindProductsDto } from '@/products/dto/find-products.dto';
import { Product } from '@/products/entities/product.entity';

@Controller('products')
@ApiTags('Productos')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear producto' })
  @ApiCreatedResponse({ description: 'Producto creado correctamente.', type: Product })
  @ApiBadRequestResponse({ description: 'Datos de entrada invalidos.' })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar productos con filtros' })
  @ApiOkResponse({ description: 'Listado de productos.', type: Product, isArray: true })
  @ApiBadRequestResponse({ description: 'Parametros de consulta invalidos.' })
  findMany(@Query() filter: FindProductsDto) {
    return this.productsService.findMany(filter);
  }
}
