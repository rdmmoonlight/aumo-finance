import {
    BadRequestException,
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    InternalServerErrorException,
    Param,
    ParseIntPipe,
    Post,
    Req
} from '@nestjs/common';
import { Request } from 'express';
import { CreatePeriodRequest, PeriodsService } from '../periods/periods.sevice';
// import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Contoh auth guard Anda

type AuthenticatedRequest = Request & { user: { id: number } };

@Controller('periods')
// @UseGuards(JwtAuthGuard) // Aktifkan jika endpoint butuh login
export class PeriodsController {
    constructor(private readonly periodsService: PeriodsService) { }

    @Get()
    async getPeriods(@Req() req: AuthenticatedRequest) {
        // Asumsi userId didapat dari token login
        const userId = req.user.id;
        return await this.periodsService.getPeriods(userId);
    }

    @Get('open-info')
    async getOpenPeriodInfo(@Req() req: AuthenticatedRequest) {
        const userId = req.user.id;
        return await this.periodsService.getOpenPeriodInfo(userId);
    }

    @Post()
    async createPeriod(
        @Req() req: AuthenticatedRequest,
        @Body() body: CreatePeriodRequest
    ) {
        const userId = req.user.id;
        const result = await this.periodsService.createPeriod(userId, body);

        if (!result.success) {
            if (result.isServerError) {
                throw new InternalServerErrorException(result.message);
            }
            throw new BadRequestException(result.message);
        }

        return result;
    }

    @Post(':id/select')
    @HttpCode(HttpStatus.OK)
    async selectPeriod(
        @Req() req: AuthenticatedRequest,
        @Param('id', ParseIntPipe) periodId: number
    ) {
        const userId = req.user.id;
        const result = await this.periodsService.selectPeriod(userId, periodId);

        if (!result) {
            throw new BadRequestException('Accounting period not found.');
        }

        return result;
    }

    @Post('clear-selection')
    @HttpCode(HttpStatus.OK)
    async clearSelection(@Req() req: AuthenticatedRequest) {
        const userId = req.user.id;
        return await this.periodsService.clearSelection(userId);
    }

    @Post(':id/close')
    @HttpCode(HttpStatus.OK)
    async closePeriod(
        @Req() req: AuthenticatedRequest,
        @Param('id', ParseIntPipe) periodId: number
    ) {
        const userId = req.user.id;
        const result = await this.periodsService.closePeriod(userId, periodId);

        if (!result.success) {
            throw new BadRequestException(result.message);
        }

        return result;
    }
}